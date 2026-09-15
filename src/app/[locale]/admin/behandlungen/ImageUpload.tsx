'use client';
import { useRef, useState } from 'react';
import { uploadImage } from '@/lib/uploadImage';
import type { ImagePosition } from './data';

const POSITION_OPTIONS: { value: ImagePosition; label: string; icon: string }[] = [
  { value: 'top',    label: 'Oben',  icon: 'vertical_align_top' },
  { value: 'center', label: 'Mitte', icon: 'vertical_align_center' },
  { value: 'bottom', label: 'Unten', icon: 'vertical_align_bottom' },
];

export default function ImageUpload({
  value, onChange, className, position, onPositionChange,
}: {
  value: string; onChange: (v: string) => void; className?: string;
  position?: ImagePosition; onPositionChange?: (p: ImagePosition) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Uploads to Supabase Storage (site-images bucket) and stores the public
  // URL — never a base64 data URI, which used to bloat site_content JSONB
  // and get embedded into every page's SSR HTML (see 0027 migration).
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen.');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative group cursor-pointer" onClick={() => ref.current?.click()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-16 w-full object-cover border border-outline-variant/30" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-primary">Ändern</span>
            <span
              className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-error"
              onClick={e => { e.stopPropagation(); onChange(''); }}
            >Entfernen</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => ref.current?.click()}
          className="w-full border border-dashed border-outline-variant/50 hover:border-primary/60 py-3 flex flex-col items-center gap-1 transition-colors group disabled:opacity-60"
        >
          <span className={`material-symbols-outlined text-[20px] text-outline group-hover:text-primary transition-colors ${uploading ? 'animate-spin' : ''}`}>
            {uploading ? 'progress_activity' : 'cloud_upload'}
          </span>
          <span className="font-label-caps text-[10px] text-outline group-hover:text-primary transition-colors">
            {uploading ? 'Wird hochgeladen…' : 'Bild hochladen'}
          </span>
        </button>
      )}
      {error && (
        <p className="font-label-caps text-[9px] text-error">{error}</p>
      )}
      {value && onPositionChange && (
        <div className="flex gap-1">
          {POSITION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPositionChange(opt.value)}
              title={`Bildausschnitt: ${opt.label}`}
              className={`flex-1 flex items-center justify-center gap-1 py-1 font-label-caps text-[9px] border transition-colors ${
                (position ?? 'top') === opt.value
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-outline-variant/40 text-outline hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
