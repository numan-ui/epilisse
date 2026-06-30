'use client';
import { useState, useMemo } from 'react';

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  since: string; // ISO date string
  totalVisits: number;
  totalSpent: string;
  lastService: string;
  lastVisit: string;
  tags: string[];
  notes: string;
};

const CUSTOMERS: Customer[] = [
  { id: 'k1',  name: 'Aylin Kaya',       phone: '+49 176 111 222', email: 'aylin@mail.de',      since: '2024-03-12', totalVisits: 14, totalSpent: '1.240,00€', lastService: 'HydraFacial Basic',    lastVisit: '2026-06-29', tags: ['Stammkundin', 'VIP'],        notes: 'Bevorzugt morgens.' },
  { id: 'k2',  name: 'Sophie Müller',    phone: '+49 176 333 444', email: 'sophie@mail.de',     since: '2024-07-05', totalVisits: 8,  totalSpent: '960,00€',   lastService: 'Botox Stirn',          lastVisit: '2026-06-29', tags: ['Stammkundin'],               notes: '' },
  { id: 'k3',  name: 'Zeynep Arslan',    phone: '+49 176 555 666', email: 'zeynep@mail.de',     since: '2025-01-20', totalVisits: 6,  totalSpent: '540,00€',   lastService: 'Oberlippe – Laser',    lastVisit: '2026-06-29', tags: ['Neukundin'],                 notes: 'Empfindliche Haut.' },
  { id: 'k4',  name: 'Lisa Wagner',      phone: '+49 176 777 888', email: 'lisa@mail.de',       since: '2023-11-01', totalVisits: 22, totalSpent: '2.100,00€', lastService: 'Gel-Maniküre',         lastVisit: '2026-06-29', tags: ['Stammkundin', 'VIP'],        notes: 'Kommt monatlich.' },
  { id: 'k5',  name: 'Fatma Demir',      phone: '+49 176 999 000', email: 'fatma@mail.de',      since: '2024-09-14', totalVisits: 10, totalSpent: '1.580,00€', lastService: 'Beine (Komplett)',     lastVisit: '2026-06-29', tags: ['Stammkundin'],               notes: '' },
  { id: 'k6',  name: 'Anna Schneider',   phone: '+49 176 100 200', email: 'anna.s@mail.de',     since: '2025-04-10', totalVisits: 3,  totalSpent: '247,00€',   lastService: 'Hyaluron Lippen',     lastVisit: '2026-06-20', tags: ['Neukundin'],                 notes: 'Interessiert an Laser.' },
  { id: 'k7',  name: 'Müge Yıldız',      phone: '+49 176 300 400', email: 'muge@mail.de',       since: '2024-02-28', totalVisits: 18, totalSpent: '2.340,00€', lastService: 'Microneedling',        lastVisit: '2026-06-05', tags: ['Stammkundin', 'VIP'],        notes: 'Profhilo-Interesse.' },
  { id: 'k8',  name: 'Lena Braun',       phone: '+49 176 500 600', email: 'lena.b@mail.de',     since: '2025-06-01', totalVisits: 2,  totalSpent: '110,00€',   lastService: 'Klassische Maniküre', lastVisit: '2026-06-15', tags: ['Neukundin'],                 notes: '' },
  { id: 'k9',  name: 'Nadia Özkan',      phone: '+49 176 700 800', email: 'nadia@mail.de',      since: '2023-08-17', totalVisits: 30, totalSpent: '3.780,00€', lastService: 'Profhilo Gesicht',     lastVisit: '2026-05-30', tags: ['Stammkundin', 'VIP'],        notes: 'Loyalste Kundin.' },
  { id: 'k10', name: 'Carina Held',      phone: '+49 176 900 010', email: 'carina@mail.de',     since: '2025-02-14', totalVisits: 4,  totalSpent: '380,00€',   lastService: 'Spa-Pediküre',         lastVisit: '2026-06-10', tags: ['Neukundin'],                 notes: '' },
  { id: 'k11', name: 'Sandra Koch',      phone: '+49 176 011 022', email: 'sandra.k@mail.de',   since: '2024-05-22', totalVisits: 11, totalSpent: '990,00€',   lastService: 'Chemical Peeling',     lastVisit: '2026-05-28', tags: ['Stammkundin'],               notes: '' },
  { id: 'k12', name: 'Hülya Şahin',     phone: '+49 176 033 044', email: 'hulya@mail.de',      since: '2024-10-30', totalVisits: 7,  totalSpent: '840,00€',   lastService: 'Baby Botox',           lastVisit: '2026-06-18', tags: ['Stammkundin'],               notes: 'Nächster Termin: Laser.' },
];

const ALL_TAGS = ['Alle', 'VIP', 'Stammkundin', 'Neukundin'];

export default function KundenPage() {
  const [search, setSearch]       = useState('');
  const [tagFilter, setTagFilter] = useState('Alle');
  const [selected, setSelected]   = useState<Customer | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [sortBy, setSortBy]       = useState<'name' | 'visits' | 'spent'>('name');

  const filtered = useMemo(() => {
    let list = CUSTOMERS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    if (tagFilter !== 'Alle') {
      list = list.filter(c => c.tags.includes(tagFilter));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name')   return a.name.localeCompare(b.name);
      if (sortBy === 'visits') return b.totalVisits - a.totalVisits;
      return 0;
    });
  }, [search, tagFilter, sortBy]);

  const vipCount    = CUSTOMERS.filter(c => c.tags.includes('VIP')).length;
  const newCount    = CUSTOMERS.filter(c => c.tags.includes('Neukundin')).length;
  const returnCount = CUSTOMERS.filter(c => c.tags.includes('Stammkundin')).length;

  const tagBadge = (tag: string) => {
    if (tag === 'VIP')         return 'bg-primary/10 text-primary';
    if (tag === 'Stammkundin') return 'bg-secondary-container/60 text-on-surface-variant';
    if (tag === 'Neukundin')   return 'bg-surface-container-high text-outline';
    return 'bg-surface-container text-outline';
  };

  return (
    <>
      {/* Top bar */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Kunden</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">{CUSTOMERS.length} Kundinnen gesamt</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-on-primary py-2.5 px-5 font-label-caps text-label-caps hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Neue Kundin
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: list ──────────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden transition-all ${selected ? 'w-[55%]' : 'w-full'}`}>

          {/* KPI strip */}
          <div className="flex items-center gap-6 px-6 py-3 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
            <Stat icon="star" label="VIP" value={String(vipCount)} />
            <div className="w-px h-8 bg-outline-variant" />
            <Stat icon="group" label="Stammkunden" value={String(returnCount)} />
            <div className="w-px h-8 bg-outline-variant" />
            <Stat icon="fiber_new" label="Neukunden" value={String(newCount)} />
          </div>

          {/* Search + filters */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-outline-variant/20 bg-surface-container-lowest shrink-0 flex-wrap">
            <div className="flex items-center gap-2 border border-outline-variant/60 px-3 py-1.5 focus-within:border-primary transition-colors flex-1 min-w-[200px]">
              <span className="material-symbols-outlined text-[18px] text-outline">search</span>
              <input
                className="flex-1 bg-transparent font-body-sm text-on-surface focus:outline-none placeholder:text-outline"
                placeholder="Suche nach Name, Telefon, E-Mail…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-outline hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Tag filter */}
            <div className="flex gap-1">
              {ALL_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTagFilter(t)}
                  className={`font-label-caps text-[10px] px-3 py-1.5 transition-all ${
                    tagFilter === t
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              className="font-label-caps text-[11px] border border-outline-variant px-2 py-1.5 bg-transparent text-on-surface focus:outline-none focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="name">Name A–Z</option>
              <option value="visits">Meiste Besuche</option>
            </select>
          </div>

          {/* Customer list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50 gap-3">
                <span className="material-symbols-outlined text-5xl">search_off</span>
                <p className="font-body-sm">Keine Ergebnisse gefunden.</p>
              </div>
            )}
            {filtered.map((cust) => {
              const isActive = selected?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelected(isActive ? null : cust)}
                  className={`flex items-center gap-4 px-6 py-4 border-b border-outline-variant/20 cursor-pointer transition-all hover:bg-surface-container-low ${
                    isActive ? 'bg-primary/5 border-l-2 border-primary' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0 font-headline-sm text-[14px] text-primary">
                    {cust.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body-md text-on-surface">{cust.name}</span>
                      {cust.tags.map(t => (
                        <span key={t} className={`font-label-caps text-[9px] px-1.5 py-0.5 ${tagBadge(t)}`}>{t}</span>
                      ))}
                    </div>
                    <p className="font-body-sm text-[12px] text-outline truncate mt-0.5">{cust.lastService} · {cust.lastVisit}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="font-body-sm text-[13px] text-on-surface font-semibold">{cust.totalSpent}</p>
                    <p className="font-label-caps text-[10px] text-outline">{cust.totalVisits} Besuche</p>
                  </div>

                  <span className={`material-symbols-outlined text-[18px] transition-colors ${isActive ? 'text-primary' : 'text-outline'}`}>
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: detail panel ─────────────────────────────── */}
        {selected && (
          <div className="w-[45%] border-l border-outline-variant flex flex-col overflow-hidden bg-surface-container-lowest">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-sm shrink-0">
              <span className="font-label-caps text-[11px] text-primary uppercase tracking-wider">Kundenprofil</span>
              <button
                onClick={() => setSelected(null)}
                className="text-outline hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center font-headline-sm text-xl text-primary">
                  {selected.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{selected.name}</h3>
                  <p className="font-body-sm text-outline">Kundin seit {selected.since}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {selected.tags.map(t => (
                      <span key={t} className={`font-label-caps text-[9px] px-1.5 py-0.5 ${tagBadge(t)}`}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-container p-4 text-center">
                  <p className="font-headline-sm text-[20px] text-primary">{selected.totalVisits}</p>
                  <p className="font-label-caps text-[9px] text-outline uppercase">Besuche</p>
                </div>
                <div className="bg-surface-container p-4 text-center">
                  <p className="font-headline-sm text-[16px] text-on-surface">{selected.totalSpent}</p>
                  <p className="font-label-caps text-[9px] text-outline uppercase">Gesamt</p>
                </div>
                <div className="bg-surface-container p-4 text-center">
                  <p className="font-body-sm text-[13px] text-on-surface">{selected.lastVisit}</p>
                  <p className="font-label-caps text-[9px] text-outline uppercase">Letzter Besuch</p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-surface-container-lowest border border-outline-variant p-5 space-y-4">
                <h4 className="font-label-caps text-[10px] text-outline uppercase">Kontakt</h4>
                {[
                  { icon: 'phone', label: 'Telefon', value: selected.phone },
                  { icon: 'mail',  label: 'E-Mail',  value: selected.email },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px] text-outline">{icon}</span>
                    <div>
                      <p className="font-label-caps text-[9px] text-outline uppercase">{label}</p>
                      <p className="font-body-sm text-on-surface">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Last service */}
              <div className="bg-surface-container-lowest border border-outline-variant p-5 space-y-2">
                <h4 className="font-label-caps text-[10px] text-outline uppercase">Letzter Service</h4>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">content_cut</span>
                  <span className="font-body-md text-on-surface">{selected.lastService}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-label-caps text-[10px] text-outline uppercase mb-2">Notizen</h4>
                <textarea
                  rows={3}
                  className="w-full border border-outline-variant bg-transparent p-3 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                  defaultValue={selected.notes}
                  placeholder="Interne Notizen zur Kundin…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-on-primary py-2.5 font-label-caps text-label-caps hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  Termin buchen
                </button>
                <button className="px-4 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button className="px-4 border border-outline-variant text-on-surface-variant hover:border-error hover:text-error transition-all">
                  <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Customer Modal ──────────────────────────────────── */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="bg-surface w-full max-w-md border border-outline-variant shadow-2xl p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Neue Kundin</h3>
              <button onClick={() => setShowAdd(false)} className="text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Vorname & Nachname', placeholder: 'Aylin Kaya',         type: 'text'  },
                { label: 'Telefon',             placeholder: '+49 176 ...',        type: 'tel'   },
                { label: 'E-Mail',              placeholder: 'info@example.de',   type: 'email' },
              ].map(({ label, placeholder, type }) => (
                <div key={label}>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              ))}

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Tag</label>
                <select className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all">
                  <option>Neukundin</option>
                  <option>Stammkundin</option>
                  <option>VIP</option>
                </select>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Notizen</label>
                <textarea
                  rows={2}
                  placeholder="Besondere Hinweise..."
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-primary text-on-primary py-3 font-label-caps text-label-caps hover:brightness-110 transition-all"
                onClick={() => setShowAdd(false)}
              >
                Kundin speichern
              </button>
              <button
                className="px-4 border border-outline-variant text-on-surface-variant hover:border-error hover:text-error transition-all font-label-caps"
                onClick={() => setShowAdd(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
      <div>
        <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">{label}</p>
        <p className="font-headline-sm text-[16px] text-on-surface">{value}</p>
      </div>
    </div>
  );
}
