'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { deriveTokens } from '@/lib/theme/derive';
import { isValidHex } from '@/lib/theme/color';
import { PRESETS, PRESET_LABEL, matchPreset, type PresetName } from '@/lib/theme/presets';
import {
  THEME_FIELDS,
  THEME_FIELD_LABEL,
  type ThemeField,
  type ThemeInput,
} from '@/lib/theme/types';

const FIELD_HINT: Record<ThemeField, string> = {
  brand: 'Buton zemini, linkler, aktif durum',
  onBrand: 'Buton üstündeki yazı',
  brandHover: 'Butona gelince / basılıyken',
  surface: 'Sayfa arka planı',
  card: 'Kartlar, panolar',
  text: 'Gövde metni ve başlıklar',
  accent: 'İkincil vurgular, kicker etiketleri',
  heroPanel: 'Ana sayfa hero panelinin zemini (açık ya da koyu)',
};

/** Apply a derived var map as inline styles on <html> (beats @theme + any
 *  injected override). Returns a cleanup that removes exactly what it set. */
function applyPreview(vars: Record<string, string>): () => void {
  const el = document.documentElement;
  const keys = Object.keys(vars);
  for (const k of keys) el.style.setProperty(k, vars[k]);
  return () => {
    for (const k of keys) el.style.removeProperty(k);
  };
}

export default function ThemeEditor() {
  const [input, setInput] = useState<ThemeInput | null>(null);
  const [saved, setSaved] = useState<ThemeInput | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/theme')
      .then((r) => r.json())
      .then((data: ThemeInput) => {
        if (!alive) return;
        setInput(data);
        setSaved(data);
      })
      .catch(() => {
        if (!alive) return;
        setInput(PRESETS.goldLux);
        setSaved(PRESETS.goldLux);
      });
    return () => {
      alive = false;
    };
  }, []);

  const allValid = useMemo(
    () => !!input && THEME_FIELDS.every((f) => isValidHex(input[f])),
    [input],
  );

  const derived = useMemo(
    () => (input && allValid ? deriveTokens(input) : null),
    [input, allValid],
  );

  // Live preview — reapply whenever the derived map changes; clean up on unmount.
  useEffect(() => {
    cleanupRef.current?.();
    cleanupRef.current = derived ? applyPreview(derived.vars) : null;
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [derived]);

  const dirty = useMemo(
    () =>
      !!input &&
      !!saved &&
      THEME_FIELDS.some((f) => (input[f] ?? '').toLowerCase() !== (saved[f] ?? '').toLowerCase()),
    [input, saved],
  );

  const activePreset: PresetName | null = input ? matchPreset(input) : null;

  const setField = useCallback((f: ThemeField, value: string) => {
    setStatus('idle');
    setInput((prev) => (prev ? { ...prev, [f]: value } : prev));
  }, []);

  const applyPreset = useCallback((name: PresetName) => {
    setStatus('idle');
    setInput({ ...PRESETS[name] });
  }, []);

  const save = useCallback(
    async (payload?: ThemeInput) => {
      const body = payload ?? input;
      if (!body) return;
      setStatus('saving');
      setErrorMsg('');
      try {
        const res = await fetch('/api/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setErrorMsg(j.error || 'Kaydedilemedi');
          setStatus('error');
          return;
        }
        setStatus('ok');
        // Full reload so SSR re-renders every surface with the saved theme and
        // the preview state resets cleanly.
        setTimeout(() => window.location.reload(), 600);
      } catch {
        setErrorMsg('Ağ hatası');
        setStatus('error');
      }
    },
    [input],
  );

  if (!input) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant p-8">
        <p className="font-body-sm text-on-surface-variant opacity-70">Tema yükleniyor…</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-8">
      <div>
        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">Farben &amp; Theme</h4>
        <p className="font-body-sm text-on-surface-variant opacity-70">
          8 marka rengini ayarla — kalan ~40 ton bunlardan otomatik türetilir ve
          okunabilirlik için AA kontrastına çekilir. Kaydettiğinde canlı sitede
          herkes için geçerli olur.
        </p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-label-caps text-[10px] text-outline uppercase">Hazır tema</span>
        {(Object.keys(PRESETS) as PresetName[]).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => applyPreset(name)}
            className={`px-4 py-2 font-label-caps text-[11px] tracking-widest uppercase border transition-colors ${
              activePreset === name
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container border-outline-variant text-on-surface hover:bg-surface-container-high'
            }`}
          >
            {PRESET_LABEL[name]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            applyPreset('goldLux');
            save(PRESETS.goldLux);
          }}
          className="ml-auto px-4 py-2 font-label-caps text-[11px] tracking-widest uppercase text-on-surface-variant underline underline-offset-4 hover:text-on-surface"
        >
          Gold Lux&apos;a dön
        </button>
      </div>

      {/* Colour fields */}
      <div className="space-y-4">
        {THEME_FIELDS.map((f, i) => {
          const value = input[f];
          const valid = isValidHex(value);
          return (
            <div
              key={f}
              className="flex items-center gap-4 py-3 border-b border-outline-variant/30 last:border-b-0"
            >
              <span className="font-label-caps text-[11px] text-outline w-5 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="font-body-md text-on-surface">{THEME_FIELD_LABEL[f]}</div>
                <div className="font-body-sm text-on-surface-variant opacity-60">{FIELD_HINT[f]}</div>
              </div>
              <input
                type="color"
                aria-label={`${THEME_FIELD_LABEL[f]} renk seçici`}
                value={valid ? value : '#000000'}
                onChange={(e) => setField(f, e.target.value.toUpperCase())}
                className="h-9 w-12 shrink-0 cursor-pointer border border-outline-variant bg-transparent"
              />
              <input
                type="text"
                aria-label={`${THEME_FIELD_LABEL[f]} hex`}
                value={value}
                spellCheck={false}
                onChange={(e) => setField(f, e.target.value)}
                className={`w-28 shrink-0 px-2 py-1.5 font-body-sm uppercase border bg-surface-container text-on-surface ${
                  valid ? 'border-outline-variant' : 'border-error text-error'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Contrast notes */}
      {derived && derived.notes.length > 0 && (
        <ul className="space-y-1.5 border-l-2 border-primary pl-4">
          {derived.notes.map((n) => (
            <li key={n} className="font-body-sm text-on-surface-variant">
              ⚠ {n}
            </li>
          ))}
        </ul>
      )}

      {!allValid && (
        <p className="font-body-sm text-error">Geçersiz renk var — hepsi #RRGGBB biçiminde olmalı.</p>
      )}

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="button"
          disabled={!allValid || !dirty || status === 'saving'}
          onClick={() => save()}
          className="bg-primary text-on-primary px-8 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'saving' ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => saved && setInput(saved)}
            className="font-label-caps text-[11px] tracking-widest uppercase text-on-surface-variant hover:text-on-surface"
          >
            Vazgeç
          </button>
        )}
        {status === 'ok' && (
          <span className="font-body-sm text-primary">Kaydedildi — sayfa yenileniyor…</span>
        )}
        {status === 'error' && <span className="font-body-sm text-error">{errorMsg}</span>}
        {status === 'idle' && dirty && (
          <span className="font-body-sm text-on-surface-variant opacity-70">
            Önizleme bu panelde canlı; kaydedene kadar siteye çıkmaz.
          </span>
        )}
      </div>
    </div>
  );
}
