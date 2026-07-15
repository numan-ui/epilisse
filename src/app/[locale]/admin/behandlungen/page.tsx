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
  const { services, campaigns, categories, addCategory } = useAdminData();

  const [addOpen, setAddOpen] = useState(false);
  const [newCat, setNewCat]   = useState<Omit<Category, 'id'>>(EMPTY_CAT);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string>('');

  const handleAdd = () => {
    if (!newCat.name.trim()) return;
    addCategory(newCat, templateId || undefined);
    setNewCat(EMPTY_CAT);
    setTemplateId('');
    setAddOpen(false);
    setIconPickerOpen(false);
  };

  return (
    <>
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Behandlungen</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">Kategorien &amp; Service-Verwaltung</p>
        </div>
        <span className="font-label-caps text-[10px] bg-primary/10 text-primary px-3 py-1.5">
          {categories.length} Kategorien
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const svcs          = services[cat.id]  ?? [];
            const cmps          = campaigns[cat.id] ?? [];
            const serviceCount  = svcs.length;
            const activeCount   = svcs.filter(s => s.active).length;
            const campaignCount = cmps.filter(c => c.active).length;

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
                      <p className="font-label-caps text-[10px] text-primary mt-0.5">{campaignCount} Kampagne{campaignCount > 1 ? 'n' : ''}</p>
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
      </div>
    </>
  );
}
