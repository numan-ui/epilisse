'use client';

import { useEffect, useState } from 'react';
import { CATEGORIES } from '../behandlungen/data';
import type { FaqChatContent } from '@/lib/content/faqChatTypes';

const SECTIONS: { id: string; label: string }[] = [
  { id: 'general', label: 'Allgemein (Öffnungszeiten, Adresse, Buchung...)' },
  ...CATEGORIES.map((c) => ({ id: c.id, label: c.name })),
];

const LOCALES: { id: 'de' | 'en' | 'tr'; label: string }[] = [
  { id: 'de', label: 'Deutsch' },
  { id: 'en', label: 'English' },
  { id: 'tr', label: 'Türkçe (nur Matching, kein sichtbarer Umschalter)' },
];

const PLACEHOLDER = `F: Frage hier eintragen?
A: Antwort hier eintragen.

F: Nächste Frage?
A: Nächste Antwort.`;

export default function FaqBotAdminPage() {
  const [content, setContent] = useState<FaqChatContent>({});
  const [locale, setLocale] = useState<'de' | 'en' | 'tr'>('de');
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    fetch('/api/faq-chat?content=draft')
      .then((r) => r.json())
      .then((data) => {
        setContent((data?.draft as FaqChatContent) ?? {});
        setEnabled(data?.enabled ?? true);
      })
      .finally(() => setLoaded(true));
  }, []);

  const toggleEnabled = async () => {
    const next = !enabled;
    setEnabled(next);
    setStatus(next ? 'Aktiviere...' : 'Deaktiviere...');
    const res = await fetch('/api/faq-chat', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: next }),
    });
    if (!res.ok) { setEnabled(!next); setStatus('Fehler.'); return; }
    setStatus(next ? 'Chatbot ist jetzt live aktiv.' : 'Chatbot ist jetzt deaktiviert — verschwindet sofort von der Webseite.');
  };

  const setSection = (sectionId: string, value: string) => {
    setContent((prev) => ({ ...prev, [locale]: { ...prev[locale], [sectionId]: value } }));
  };

  const saveDraft = async () => {
    setStatus('Speichern...');
    const res = await fetch('/api/faq-chat', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content),
    });
    setStatus(res.ok ? 'Entwurf gespeichert.' : 'Fehler beim Speichern.');
  };

  const publish = async () => {
    await saveDraft();
    setStatus('Veröffentlichen...');
    const res = await fetch('/api/faq-chat', { method: 'POST' });
    setStatus(res.ok ? 'Veröffentlicht — live auf der Webseite.' : 'Fehler beim Veröffentlichen.');
  };

  if (!loaded) return <div className="p-8 text-on-surface-variant">Lädt...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary font-bold uppercase tracking-wide">FAQ-Chatbot</h1>
          <p className="text-on-surface-variant text-body-sm mt-2">
            Pro Bereich ein Textfeld. Format: eine Zeile mit <code>F: Frage</code>, danach eine Zeile mit <code>A: Antwort</code> (Antwort darf mehrzeilig sein).
            Deutsch und Englisch sind im Chat als Umschalter sichtbar; Türkisch wird nur im Hintergrund erkannt — schreibt ein Kunde auf Türkisch, antwortet der Bot trotzdem auf Türkisch.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleEnabled}
          className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2 font-label-caps text-[11px] uppercase tracking-wide transition-colors ${
            enabled ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-on-primary' : 'bg-outline'}`} />
          {enabled ? 'Chatbot aktiv' : 'Chatbot deaktiviert'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-outline-variant/40 pb-3">
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setLocale(l.id)}
            className={`px-3 py-1.5 rounded-full font-label-caps text-[11px] uppercase tracking-wide transition-colors ${
              locale === l.id ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:text-primary'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {SECTIONS.map((section) => (
        <div key={section.id} className="space-y-2">
          <label className="font-label-caps text-[12px] uppercase tracking-wide text-on-surface-variant">{section.label}</label>
          <textarea
            value={content[locale]?.[section.id] ?? ''}
            onChange={(e) => setSection(section.id, e.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary resize-y"
          />
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2 sticky bottom-0 bg-surface py-4">
        <button
          type="button"
          onClick={saveDraft}
          className="border border-outline-variant rounded px-4 py-2 font-label-caps text-label-caps uppercase hover:border-primary hover:text-primary transition-colors"
        >
          Entwurf speichern
        </button>
        <button
          type="button"
          onClick={publish}
          className="bg-primary text-on-primary rounded px-4 py-2 font-label-caps text-label-caps uppercase hover:brightness-90 transition-all active:scale-95"
        >
          Veröffentlichen
        </button>
        {status && <span className="text-on-surface-variant text-body-sm">{status}</span>}
      </div>
    </div>
  );
}
