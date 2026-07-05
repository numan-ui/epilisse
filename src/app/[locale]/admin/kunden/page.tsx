'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';

type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  since: string; // ISO date string
  totalVisits: number;
  totalSpent: number;
  lastService: string | null;
  lastVisit: string | null; // ISO timestamp
  tags: string[];
  notes: string;
};

const ALL_TAGS = ['Alle', 'VIP', 'Stammkundin', 'Neukundin'];

const formatMoney = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';

const formatDate = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');

export default function KundenPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [tagFilter, setTagFilter] = useState('Alle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [sortBy, setSortBy]       = useState<'name' | 'visits' | 'spent'>('name');
  const [notesDraft, setNotesDraft] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', tag: 'Neukundin', notes: '' });

  const loadCustomers = useCallback(() => {
    setLoading(true);
    fetch('/api/customers')
      .then((r) => r.json())
      .then((data) => setCustomers(data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const selected = customers.find((c) => c.id === selectedId) ?? null;

  useEffect(() => { setNotesDraft(selected?.notes ?? ''); }, [selected?.id]);

  const filtered = useMemo(() => {
    let list = customers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q) ||
        (c.email ?? '').toLowerCase().includes(q)
      );
    }
    if (tagFilter !== 'Alle') {
      list = list.filter(c => c.tags.includes(tagFilter));
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name')   return a.name.localeCompare(b.name);
      if (sortBy === 'visits') return b.totalVisits - a.totalVisits;
      return b.totalSpent - a.totalSpent;
    });
  }, [customers, search, tagFilter, sortBy]);

  const vipCount    = customers.filter(c => c.tags.includes('VIP')).length;
  const newCount    = customers.filter(c => c.tags.includes('Neukundin')).length;
  const returnCount = customers.filter(c => c.tags.includes('Stammkundin')).length;

  const tagBadge = (tag: string) => {
    if (tag === 'VIP')         return 'bg-primary/10 text-primary';
    if (tag === 'Stammkundin') return 'bg-secondary-container/60 text-on-surface-variant';
    if (tag === 'Neukundin')   return 'bg-surface-container-high text-outline';
    return 'bg-surface-container text-outline';
  };

  const saveNotes = async () => {
    if (!selected) return;
    await fetch(`/api/customers/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notesDraft }),
    });
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, notes: notesDraft } : c));
  };

  const deleteCustomer = async () => {
    if (!selected) return;
    if (!window.confirm(`${selected.name} wirklich löschen?`)) return;
    await fetch(`/api/customers/${selected.id}`, { method: 'DELETE' });
    setCustomers(prev => prev.filter(c => c.id !== selected.id));
    setSelectedId(null);
  };

  const createCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCustomer.name,
        phone: newCustomer.phone || null,
        email: newCustomer.email || null,
        tags: [newCustomer.tag],
        notes: newCustomer.notes,
      }),
    });
    const created = await res.json();
    setCustomers(prev => [...prev, { ...created, totalVisits: 0, totalSpent: 0, lastService: null, lastVisit: null }]);
    setNewCustomer({ name: '', phone: '', email: '', tag: 'Neukundin', notes: '' });
    setShowAdd(false);
  };

  return (
    <>
      {/* Top bar */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Kunden</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">{customers.length} Kundinnen gesamt</p>
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
            {loading && (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50 gap-3">
                <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                <p className="font-body-sm">Lädt…</p>
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-50 gap-3">
                <span className="material-symbols-outlined text-5xl">search_off</span>
                <p className="font-body-sm">Keine Ergebnisse gefunden.</p>
              </div>
            )}
            {!loading && filtered.map((cust) => {
              const isActive = selectedId === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedId(isActive ? null : cust.id)}
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
                    <p className="font-body-sm text-[12px] text-outline truncate mt-0.5">{cust.lastService ?? 'Noch kein Besuch'} · {formatDate(cust.lastVisit)}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0 hidden md:block">
                    <p className="font-body-sm text-[13px] text-on-surface font-semibold">{formatMoney(cust.totalSpent)}</p>
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
                onClick={() => setSelectedId(null)}
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
                  <p className="font-body-sm text-outline">Kundin seit {formatDate(selected.since)}</p>
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
                  <p className="font-headline-sm text-[16px] text-on-surface">{formatMoney(selected.totalSpent)}</p>
                  <p className="font-label-caps text-[9px] text-outline uppercase">Gesamt</p>
                </div>
                <div className="bg-surface-container p-4 text-center">
                  <p className="font-body-sm text-[13px] text-on-surface">{formatDate(selected.lastVisit)}</p>
                  <p className="font-label-caps text-[9px] text-outline uppercase">Letzter Besuch</p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-surface-container-lowest border border-outline-variant p-5 space-y-4">
                <h4 className="font-label-caps text-[10px] text-outline uppercase">Kontakt</h4>
                {[
                  { icon: 'phone', label: 'Telefon', value: selected.phone || '—' },
                  { icon: 'mail',  label: 'E-Mail',  value: selected.email || '—' },
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
                  <span className="font-body-md text-on-surface">{selected.lastService ?? 'Noch kein Besuch'}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-label-caps text-[10px] text-outline uppercase mb-2">Notizen</h4>
                <textarea
                  rows={3}
                  className="w-full border border-outline-variant bg-transparent p-3 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  onBlur={saveNotes}
                  placeholder="Interne Notizen zur Kundin…"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-on-primary py-2.5 font-label-caps text-label-caps hover:brightness-110 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                  Termin buchen
                </button>
                <button
                  onClick={deleteCustomer}
                  className="px-4 border border-outline-variant text-on-surface-variant hover:border-error hover:text-error transition-all"
                >
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
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Vorname & Nachname</label>
                <input
                  type="text"
                  placeholder="Aylin Kaya"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Telefon</label>
                <input
                  type="tel"
                  placeholder="+49 176 ..."
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">E-Mail</label>
                <input
                  type="email"
                  placeholder="info@example.de"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Tag</label>
                <select
                  value={newCustomer.tag}
                  onChange={(e) => setNewCustomer(p => ({ ...p, tag: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                >
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
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-primary text-on-primary py-3 font-label-caps text-label-caps hover:brightness-110 transition-all"
                onClick={createCustomer}
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
