'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminData } from './AdminDataContext';
import type { Category } from './data';

const ICON_OPTIONS = [
  'auto_awesome', 'face', 'self_improvement', 'vaccines', 'spa', 'favorite',
  'diamond', 'health_and_beauty', 'auto_fix_high', 'star', 'local_florist',
  'emoji_nature', 'flare', 'water_drop', 'volunteer_activism', 'colorize',
];

const EMPTY_CAT: Omit<Category, 'id'> = { icon: 'auto_awesome', name: '', desc: '', visible: true, image: '', kicker: 'BEHANDLUNG' };

export default function BehandlungenPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const {
    services, aktionen, categories, categoriesLoaded, pageContent, addCategory,
    settings, landingContent, heroSlides, aboutValues, reviews, faqGroups,
  } = useAdminData();

  const [addOpen, setAddOpen] = useState(false);
  const [newCat, setNewCat]   = useState<Omit<Category, 'id'>>(EMPTY_CAT);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleAdd = () => {
    if (!newCat.name.trim()) return;
    addCategory(newCat, templateId || undefined);
    setNewCat(EMPTY_CAT);
    setTemplateId('');
    setAddOpen(false);
    setIconPickerOpen(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    try {
      // Flush the admin's current (localStorage-backed) list into `draft`
      // ourselves first — AdminDataContext's write-through is debounced
      // (~700ms), so without this, publishing right after an edit (e.g.
      // uploading an image, then immediately hitting this button) could
      // copy a stale pre-edit draft into `published`, silently reverting
      // the just-made change on the live site.
      const putRes = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories),
      });
      if (!putRes.ok) {
        const putBody = await putRes.json().catch(() => ({}));
        throw new Error(putBody.error || 'Speichern fehlgeschlagen.');
      }

      // Flush the Seiteninhalt (page content) and the rest of the CMS bundle
      // into their drafts too — all three write-throughs are debounced.
      const pcPut = await fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageContent),
      });
      if (!pcPut.ok) {
        const pcBody = await pcPut.json().catch(() => ({}));
        throw new Error(pcBody.error || 'Speichern der Seiteninhalte fehlgeschlagen.');
      }

      const contentPayload = JSON.stringify({ services, aktionen, settings, landingContent, heroSlides, aboutValues, reviews, faqGroups });
      const contentPut = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: contentPayload,
      });
      if (!contentPut.ok) {
        const cBody = await contentPut.json().catch(() => ({} as { error?: string }));
        const sizeMb = (new Blob([contentPayload]).size / (1024 * 1024)).toFixed(1);
        const hint = contentPut.status === 413 || Number(sizeMb) > 4
          ? ` — die Inhalte sind ${sizeMb} MB groß (Limit ~4,5 MB). Bitte hochgeladene Bilder (Hero-Slides, Inhaberin-Foto) verkleinern (<500 KB) und erneut versuchen.`
          : '';
        throw new Error((cBody.error || `Speichern der Inhalte fehlgeschlagen (HTTP ${contentPut.status})`) + hint);
      }

      const res = await fetch('/api/categories', { method: 'POST' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Veröffentlichung fehlgeschlagen.');

      const pcPub = await fetch('/api/page-content', { method: 'POST' });
      const pcPubBody = await pcPub.json().catch(() => ({}));
      if (!pcPub.ok) throw new Error(pcPubBody.error || 'Veröffentlichung der Seiteninhalte fehlgeschlagen.');

      const contentPub = await fetch('/api/content', { method: 'POST' });
      const contentPubBody = await contentPub.json().catch(() => ({}));
      if (!contentPub.ok) throw new Error(contentPubBody.error || 'Veröffentlichung der Inhalte fehlgeschlagen.');

      setPublishMsg({ ok: true, text: 'Alle Änderungen sind jetzt live.' });
    } catch (err) {
      setPublishMsg({ ok: false, text: err instanceof Error ? err.message : 'Veröffentlichung fehlgeschlagen.' });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Behandlungen</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">Kategorien &amp; Service-Verwaltung</p>
        </div>
        <div className="flex items-center gap-3">
          {publishMsg && (
            <span className={`font-body-sm text-[12px] ${publishMsg.ok ? 'text-primary' : 'text-error'}`}>
              {publishMsg.text}
            </span>
          )}
          {categoriesLoaded && (
            <span className="font-label-caps text-[10px] bg-primary/10 text-primary px-3 py-1.5">
              {categories.length} Kategorien
            </span>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing || !categoriesLoaded}
            title={categoriesLoaded ? undefined : 'Kategorien werden geladen…'}
            className="font-label-caps text-[11px] uppercase tracking-widest bg-primary text-on-primary px-4 py-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-cta)]"
          >
            {publishing ? 'Wird veröffentlicht…' : 'Veröffentlichen'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {/* categories starts each mount at the code CATEGORIES defaults, then swaps to
            the admin's real localStorage list once the load effect runs (AdminDataContext).
            Rendering the grid before that swap flashed 3 default cards on every page
            load/navigation — indistinguishable from a real data loss (feedback 2026-09-04).
            A skeleton until categoriesLoaded removes that flash entirely. */}
        {!categoriesLoaded ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5 flex flex-col gap-3 min-h-[130px] animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-outline-variant/40" />
                <div className="h-4 w-2/3 bg-outline-variant/40 rounded" />
                <div className="h-3 w-1/2 bg-outline-variant/30 rounded mt-auto" />
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const svcs          = services[cat.id]  ?? [];
            const serviceCount  = svcs.length;
            const activeCount   = svcs.filter(s => s.active).length;
            const campaignCount = aktionen.filter(a => a.category === cat.id && a.activeInCategory).length;

            return (
              <Link
                key={cat.id}
                href={`/${locale}/admin/behandlungen/${cat.id}`}
                className="group relative bg-surface-container-lowest border border-outline-variant/60 p-5 rounded-xl flex flex-col gap-3 hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    cat.visible ? 'bg-secondary-container/50 text-primary' : 'bg-surface-container text-outline'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  </div>
                  {!cat.visible
                    ? <span className="font-label-caps text-[9px] bg-error-container text-error px-1.5 py-0.5">Verborgen</span>
                    : <span className="font-label-caps text-[9px] bg-primary/10 text-primary px-1.5 py-0.5">Aktiv</span>
                  }
                </div>

                <h4 className="font-headline-sm text-[15px] text-on-surface leading-snug">{cat.name}</h4>

                <div className="flex items-center justify-between mt-auto pt-1 border-t border-outline-variant/30">
                  <div>
                    <p className="font-body-sm text-[11px] text-outline">{activeCount}/{serviceCount} Services</p>
                    {campaignCount > 0 && (
                      <p className="font-label-caps text-[10px] text-primary mt-0.5">{campaignCount} Aktion{campaignCount > 1 ? 'en' : ''}</p>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Neue Kategorie card */}
          {!addOpen ? (
            <button
              onClick={() => setAddOpen(true)}
              className="border-2 border-dashed border-outline-variant bg-surface/50 rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary transition-all group min-h-[130px]"
            >
              <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">add_circle</span>
              <span className="font-label-caps uppercase tracking-widest text-[10px]">Neue Kategorie</span>
            </button>
          ) : (
            <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-5 flex flex-col gap-3">
              {/* Icon picker */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIconPickerOpen(o => !o)}
                  className="w-10 h-10 rounded-lg bg-secondary-container/50 text-primary flex items-center justify-center hover:bg-secondary-container transition-colors shrink-0"
                  title="Icon wählen"
                >
                  <span className="material-symbols-outlined text-[20px]">{newCat.icon}</span>
                </button>
                <input
                  autoFocus
                  className="flex-1 bg-transparent border-b border-primary focus:outline-none font-headline-sm text-[15px] text-on-surface placeholder:text-outline py-1"
                  placeholder="Kategoriename *"
                  value={newCat.name}
                  onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
              </div>

              {iconPickerOpen && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-surface border border-outline-variant/40 rounded-lg">
                  {ICON_OPTIONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => { setNewCat(p => ({ ...p, icon: ic })); setIconPickerOpen(false); }}
                      className={`material-symbols-outlined text-[20px] p-1.5 rounded transition-colors ${
                        newCat.icon === ic ? 'bg-primary text-on-primary' : 'text-outline hover:bg-secondary-container/40 hover:text-primary'
                      }`}
                      title={ic}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              )}

              <input
                className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:outline-none font-body-sm text-[13px] text-on-surface placeholder:text-outline py-1 transition-colors"
                placeholder="Kurzbeschreibung (optional)"
                value={newCat.desc}
                onChange={e => setNewCat(p => ({ ...p, desc: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />

              <input
                className="w-full bg-transparent border-b border-outline-variant/50 focus:border-primary focus:outline-none font-label-caps text-[11px] uppercase tracking-widest text-on-surface placeholder:text-outline py-1 transition-colors"
                placeholder="Kicker-Label (z. B. TECHNOLOGIE)"
                value={newCat.kicker}
                onChange={e => setNewCat(p => ({ ...p, kicker: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />

              <div>
                <label className="font-label-caps text-[9px] text-outline uppercase tracking-wider block mb-1">
                  Vorlage (kopiert Seiteninhalt &amp; Beispiel-Services)
                </label>
                <select
                  className="w-full bg-surface border border-outline-variant/50 focus:border-primary focus:outline-none font-body-sm text-[12px] text-on-surface py-1.5 px-2 transition-colors"
                  value={templateId}
                  onChange={e => setTemplateId(e.target.value)}
                >
                  <option value="">Keine Vorlage (leer beginnen)</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={handleAdd}
                  disabled={!newCat.name.trim()}
                  className="flex-1 bg-primary text-on-primary font-label-caps text-[11px] py-2 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Hinzufügen
                </button>
                <button
                  onClick={() => { setAddOpen(false); setNewCat(EMPTY_CAT); setIconPickerOpen(false); }}
                  className="text-outline hover:text-error transition-colors px-2"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
    </>
  );
}
