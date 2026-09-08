'use client';
import type { Aktion, ImagePosition } from '../behandlungen/data';
import ImageUpload from '../behandlungen/ImageUpload';
import { validityText, countdownLabel } from '@/lib/aktion';

/** One editable Aktion — shared by /admin/aktionen and the category detail page. */
export function AktionCard({
  a, homeLocked, onField, onRemove,
}: {
  a: Aktion;
  homeLocked: boolean;
  onField: (field: keyof Aktion, value: string | boolean) => void;
  onRemove: () => void;
}) {
  const preview = validityText(a.startDate, a.endDate);
  const badge = countdownLabel(a.endDate);
  return (
    <div data-testid="aktion-card" className="bg-surface-container-lowest border border-outline-variant/60 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <input
          className="flex-1 font-headline-sm text-[16px] text-on-surface bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none"
          value={a.title}
          onChange={e => onField('title', e.target.value)}
          placeholder="Titel der Aktion *"
        />
        <button type="button" onClick={onRemove} aria-label="Aktion löschen"
          className="text-outline hover:text-error transition-colors shrink-0">
          <span className="material-symbols-outlined text-[18px]">delete_outline</span>
        </button>
      </div>

      <input
        className="w-full font-label-caps text-[10px] text-primary bg-transparent border-none focus:outline-none"
        value={a.label} onChange={e => onField('label', e.target.value)} placeholder="LABEL (z.B. AKTION)"
      />
      <textarea
        className="w-full font-body-sm text-[13px] text-on-surface-variant bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none resize-none"
        rows={2} value={a.desc} onChange={e => onField('desc', e.target.value)} placeholder="Kurzbeschreibung…"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1 border border-outline-variant px-2 py-1 w-32">
          <span className="font-label-caps text-[10px] text-primary shrink-0">Preis</span>
          <input className="w-full bg-transparent text-[14px] font-bold text-primary focus:outline-none"
            value={a.price} onChange={e => onField('price', e.target.value)} placeholder="0,00€" />
        </label>
        <label className="flex items-center gap-1 border border-outline-variant/50 px-2 py-1 w-32">
          <span className="font-label-caps text-[10px] text-outline shrink-0">Statt</span>
          <input className="w-full bg-transparent text-[13px] text-outline line-through focus:outline-none"
            value={a.oldPrice ?? ''} onChange={e => onField('oldPrice', e.target.value)} placeholder="0,00€" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-2">
          Startdatum
          <input type="date" className="border border-outline-variant/50 px-2 py-1 text-[12px] focus:outline-none focus:border-primary"
            value={a.startDate ?? ''} onChange={e => onField('startDate', e.target.value)} />
        </label>
        <label className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-2">
          Enddatum
          <input type="date" className="border border-outline-variant/50 px-2 py-1 text-[12px] focus:outline-none focus:border-primary"
            value={a.endDate ?? ''} onChange={e => onField('endDate', e.target.value)} />
        </label>
        {preview && <span className="font-body-sm text-[11.5px] text-outline">{preview}</span>}
        {badge && (
          <span className="font-label-caps text-[10px] text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <input className="flex-1 border-b border-outline-variant/50 focus:border-primary bg-transparent text-[12px] py-0.5 focus:outline-none"
          value={a.cta} onChange={e => onField('cta', e.target.value)} placeholder="CTA-Text (z.B. JETZT BUCHEN)" />
        <input className="w-32 border-b border-outline-variant/50 focus:border-primary bg-transparent text-[12px] py-0.5 focus:outline-none font-mono"
          value={a.icon} onChange={e => onField('icon', e.target.value)} placeholder="Icon-Name" />
      </div>

      <ImageUpload
        value={a.image}
        onChange={(v: string) => onField('image', v)}
        position={a.imagePosition}
        onPositionChange={(p: ImagePosition) => onField('imagePosition', p)}
      />

      <div className="flex flex-wrap gap-5 pt-2 border-t border-outline-variant/30">
        <Switch
          label="Im Kategoriebereich aktiv"
          checked={a.activeInCategory}
          onChange={v => {
            onField('activeInCategory', v);
            if (!v && a.activeOnHome) onField('activeOnHome', false);
          }}
        />
        <Switch
          label="Auf Startseite aktiv"
          checked={a.activeOnHome}
          disabled={!a.activeInCategory || homeLocked}
          hint={!a.activeInCategory ? 'zuerst im Kategoriebereich aktivieren' : homeLocked ? 'Startseiten-Limit erreicht' : undefined}
          onChange={v => onField('activeOnHome', v)}
        />
      </div>
    </div>
  );
}

function Switch({
  label, checked, disabled, hint, onChange,
}: {
  label: string; checked: boolean; disabled?: boolean; hint?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-2 ${disabled ? 'opacity-40' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-outline-variant'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      <span className="font-body-sm text-[12px] text-on-surface">
        {label}{hint && <em className="text-outline not-italic"> — {hint}</em>}
      </span>
    </label>
  );
}
