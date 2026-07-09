'use client';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAdminCategories } from '@/hooks/useAdminCategories';

type Gender = 'herr' | 'frau' | 'keine_angabe';

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
  gender: Gender;
  is_active: boolean;
  class: 'A' | 'B' | 'C' | null;
  consent_datenschutz_at: string | null;
  consent_behandlung_at: string | null;
  consent_marketing_at: string | null;
};

const GENDER_LABEL: Record<Gender, string> = {
  herr: 'Herr',
  frau: 'Frau',
  keine_angabe: 'Keine Angabe',
};

type CustomerAppointment = {
  id: string;
  service_name: string;
  price: number | null;
  starts_at: string;
  status: 'confirmed' | 'pending' | 'cancelled';
};

const ALL_TAGS = ['Alle', 'VIP', 'Neu'];

const isNewThisMonth = (sinceIso: string) => {
  const since = new Date(sinceIso);
  const now = new Date();
  return since.getFullYear() === now.getFullYear() && since.getMonth() === now.getMonth();
};

const APPT_STATUS: Record<CustomerAppointment['status'], { label: string; badge: string }> = {
  confirmed: { label: 'Gekommen',        badge: 'bg-primary/10 text-primary' },
  pending:   { label: 'Ausstehend',      badge: 'bg-amber-50 text-amber-700' },
  cancelled: { label: 'Nicht erschienen',badge: 'bg-error-container text-error' },
};

const formatMoney = (n: number) =>
  n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '€';

const formatDate = (iso: string | null) => (iso ? iso.slice(0, 10) : '—');
const formatDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function KundenPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [tagFilter, setTagFilter] = useState('Alle');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [sortBy, setSortBy]       = useState<'name' | 'visits' | 'spent'>('name');
  const [notesDraft, setNotesDraft] = useState('');
  const [newCustomer, setNewCustomer] = useState<{ name: string; phone: string; email: string; vip: boolean; notes: string; gender: Gender; klass: '' | 'A' | 'B' | 'C'; category: string }>({ name: '', phone: '', email: '', vip: false, notes: '', gender: 'keine_angabe', klass: '', category: '' });
  const categories = useAdminCategories();
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({ name: '', phone: '', email: '', gender: 'keine_angabe' as Gender, klass: '' as '' | 'A' | 'B' | 'C' });
  const [classFilter, setClassFilter] = useState<'Alle' | 'A' | 'B' | 'C'>('Alle');
  const [showInactive, setShowInactive] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [history, setHistory] = useState<CustomerAppointment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  useEffect(() => {
    setEditing(false);
    setEditDraft({
      name: selected?.name ?? '',
      phone: selected?.phone ?? '',
      email: selected?.email ?? '',
      gender: selected?.gender ?? 'keine_angabe',
      klass: selected?.class ?? '',
    });
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    setHistoryLoading(true);
    fetch(`/api/customers/${selected.id}`)
      .then((r) => r.json())
      .then((data) => setHistory(data.appointments ?? []))
      .finally(() => setHistoryLoading(false));
  }, [selected?.id]);

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
    if (tagFilter === 'VIP') {
      list = list.filter(c => c.tags.includes('VIP'));
    } else if (tagFilter === 'Neu') {
      list = list.filter(c => isNewThisMonth(c.since));
    }
    if (classFilter !== 'Alle') {
      list = list.filter(c => c.class === classFilter);
    }
    if (!showInactive) {
      list = list.filter(c => c.is_active !== false);
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'name')   return a.name.localeCompare(b.name);
      if (sortBy === 'visits') return b.totalVisits - a.totalVisits;
      return b.totalSpent - a.totalSpent;
    });
  }, [customers, search, tagFilter, classFilter, showInactive, sortBy]);

  const vipCount = customers.filter(c => c.tags.includes('VIP')).length;
  const newCount = customers.filter(c => isNewThisMonth(c.since)).length;

  const tagBadge = (tag: string) => {
    if (tag === 'VIP') return 'bg-primary/10 text-primary';
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

  const saveEdit = async () => {
    if (!selected || !editDraft.name.trim()) return;
    const res = await fetch(`/api/customers/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editDraft.name,
        phone: editDraft.phone || null,
        email: editDraft.email || null,
        gender: editDraft.gender,
        class: editDraft.klass || null,
      }),
    });
    const updated = await res.json();
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, ...updated } : c));
    setEditing(false);
  };

  const toggleActive = async () => {
    if (!selected) return;
    const nextActive = selected.is_active === false;
    await fetch(`/api/customers/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: nextActive }),
    });
    setCustomers(prev => prev.map(c => c.id === selected.id ? { ...c, is_active: nextActive } : c));
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
    setAddError(null);
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCustomer.name,
        phone: newCustomer.phone || null,
        email: newCustomer.email || null,
        tags: newCustomer.vip ? ['VIP'] : [],
        notes: newCustomer.notes,
        gender: newCustomer.gender,
        class: newCustomer.klass || null,
        category: newCustomer.category || null,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setAddError(body.error ?? 'Etwas ist schiefgelaufen.');
      return;
    }
    const created = await res.json();
    setCustomers(prev => [...prev, { ...created, totalVisits: 0, totalSpent: 0, lastService: null, lastVisit: null }]);
    setNewCustomer({ name: '', phone: '', email: '', vip: false, notes: '', gender: 'keine_angabe', klass: '', category: '' });
    setShowAdd(false);
  };

  return (
    <>
      {/* Top bar */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Kunden</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">{customers.length} Kunden gesamt</p>
        </div>
        <button
          onClick={() => { setAddError(null); setShowAdd(true); }}
          className="flex items-center gap-2 bg-primary text-on-primary py-2.5 px-5 font-label-caps text-label-caps hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Kunde hinzufügen
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: list ──────────────────────────────────────── */}
        <div className={`flex flex-col overflow-hidden transition-all ${selected ? 'w-[55%]' : 'w-full'}`}>

          {/* KPI strip */}
          <div className="flex items-center gap-6 px-6 py-3 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
            <Stat icon="star" label="VIP" value={String(vipCount)} />
            <div className="w-px h-8 bg-outline-variant" />
            <Stat icon="fiber_new" label="Neu diesen Monat" value={String(newCount)} />
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
                      ? 'border border-primary bg-primary text-on-primary'
                      : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Class filter */}
            <div className="flex gap-1">
              {(['Alle', 'A', 'B', 'C'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setClassFilter(k)}
                  className={`font-label-caps text-[10px] px-3 py-1.5 transition-all ${
                    classFilter === k
                      ? 'border border-primary bg-primary text-on-primary'
                      : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {k === 'Alle' ? 'Alle Klassen' : `Klasse ${k}`}
                </button>
              ))}
            </div>

            {/* Inactive toggle */}
            <label className="flex items-center gap-1.5 font-label-caps text-[10px] text-on-surface-variant cursor-pointer select-none">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
              Inaktive anzeigen
            </label>

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
                  } ${cust.is_active === false ? 'opacity-50' : ''}`}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0 font-headline-sm text-[14px] text-primary">
                    {cust.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-body-md text-on-surface">{cust.name}</span>
                      {cust.class && (
                        <span className="font-label-caps text-[9px] px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant border border-outline-variant/50">Klasse {cust.class}</span>
                      )}
                      {cust.tags.map(t => (
                        <span key={t} className={`font-label-caps text-[9px] px-1.5 py-0.5 ${tagBadge(t)}`}>{t}</span>
                      ))}
                      {isNewThisMonth(cust.since) && (
                        <span className="font-label-caps text-[9px] px-1.5 py-0.5 bg-surface-container-high text-outline">Neu</span>
                      )}
                      {cust.is_active === false && (
                        <span className="font-label-caps text-[9px] px-1.5 py-0.5 bg-error-container text-error">Inaktiv</span>
                      )}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleActive}
                  className={`font-label-caps text-[10px] px-3 py-1.5 border transition-all ${
                    selected.is_active !== false
                      ? 'border-outline-variant text-on-surface-variant hover:border-error hover:text-error'
                      : 'border-primary text-primary'
                  }`}
                >
                  {selected.is_active !== false ? 'Deaktivieren' : 'Aktivieren'}
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-outline hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center font-headline-sm text-xl text-primary">
                    {selected.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {GENDER_LABEL[selected.gender] !== 'Keine Angabe' ? `${GENDER_LABEL[selected.gender]} ` : ''}{selected.name}
                    </h3>
                    <p className="font-body-sm text-outline">Kundin seit {formatDate(selected.since)}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {selected.class && (
                        <span className="font-label-caps text-[9px] px-1.5 py-0.5 bg-surface-container-high text-on-surface-variant border border-outline-variant/50">Klasse {selected.class}</span>
                      )}
                      {selected.tags.map(t => (
                        <span key={t} className={`font-label-caps text-[9px] px-1.5 py-0.5 ${tagBadge(t)}`}>{t}</span>
                      ))}
                      {isNewThisMonth(selected.since) && (
                        <span className="font-label-caps text-[9px] px-1.5 py-0.5 bg-surface-container-high text-outline">Neu</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(e => !e)}
                  className="text-outline hover:text-primary transition-colors shrink-0"
                  title="Bearbeiten"
                >
                  <span className="material-symbols-outlined text-[20px]">{editing ? 'close' : 'edit'}</span>
                </button>
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
                {!editing ? (
                  <>
                    {[
                      { icon: 'phone', label: 'Telefon', value: selected.phone || '—' },
                      { icon: 'mail',  label: 'E-Mail',  value: selected.email || '—' },
                      { icon: 'badge', label: 'Anrede',  value: GENDER_LABEL[selected.gender] },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-outline">{icon}</span>
                        <div>
                          <p className="font-label-caps text-[9px] text-outline uppercase">{label}</p>
                          <p className="font-body-sm text-on-surface">{value}</p>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="font-label-caps text-[9px] text-outline uppercase block mb-1">Name</label>
                      <input
                        type="text"
                        value={editDraft.name}
                        onChange={(e) => setEditDraft(p => ({ ...p, name: e.target.value }))}
                        className="w-full border-b border-outline-variant bg-transparent py-1.5 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label-caps text-[9px] text-outline uppercase block mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={editDraft.phone}
                        onChange={(e) => setEditDraft(p => ({ ...p, phone: e.target.value }))}
                        className="w-full border-b border-outline-variant bg-transparent py-1.5 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-label-caps text-[9px] text-outline uppercase block mb-1">E-Mail</label>
                      <input
                        type="email"
                        value={editDraft.email}
                        onChange={(e) => setEditDraft(p => ({ ...p, email: e.target.value }))}
                        className="w-full border-b border-outline-variant bg-transparent py-1.5 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-label-caps text-[9px] text-outline uppercase block mb-1">Anrede</label>
                        <select
                          value={editDraft.gender}
                          onChange={(e) => setEditDraft(p => ({ ...p, gender: e.target.value as Gender }))}
                          className="w-full border-b border-outline-variant bg-transparent py-1.5 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                        >
                          <option value="herr">Herr</option>
                          <option value="frau">Frau</option>
                          <option value="keine_angabe">Keine Angabe</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-label-caps text-[9px] text-outline uppercase block mb-1">Klasse</label>
                        <select
                          value={editDraft.klass}
                          onChange={(e) => setEditDraft(p => ({ ...p, klass: e.target.value as typeof editDraft.klass }))}
                          className="w-full border-b border-outline-variant bg-transparent py-1.5 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                        >
                          <option value="">—</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={saveEdit}
                      className="w-full bg-primary text-on-primary py-2 font-label-caps text-label-caps hover:brightness-110 transition-all mt-1"
                    >
                      Speichern
                    </button>
                  </div>
                )}
              </div>

              {/* Consent / Einwilligungen */}
              <div className="bg-surface-container-lowest border border-outline-variant p-5 space-y-3">
                <h4 className="font-label-caps text-[10px] text-outline uppercase">Einwilligungen</h4>
                {[
                  { label: 'Datenschutz', at: selected.consent_datenschutz_at },
                  { label: 'Behandlung',  at: selected.consent_behandlung_at },
                  { label: 'Marketing',   at: selected.consent_marketing_at },
                ].map(({ label, at }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="font-body-sm text-on-surface">{label}</span>
                    {at ? (
                      <span className="font-label-caps text-[9px] px-2 py-1 uppercase bg-primary/10 text-primary">
                        Erteilt · {formatDateTime(at)}
                      </span>
                    ) : (
                      <span className="font-label-caps text-[9px] px-2 py-1 uppercase bg-error-container text-error">
                        Nicht erteilt
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Appointment history */}
              <div className="bg-surface-container-lowest border border-outline-variant p-5 space-y-3">
                <h4 className="font-label-caps text-[10px] text-outline uppercase">Terminverlauf</h4>
                {historyLoading && (
                  <p className="font-body-sm text-outline">Lädt…</p>
                )}
                {!historyLoading && history.length === 0 && (
                  <p className="font-body-sm text-outline">Noch kein Termin.</p>
                )}
                {!historyLoading && history.length > 0 && (
                  <div className="divide-y divide-outline-variant/20">
                    {history.map((a) => {
                      const st = APPT_STATUS[a.status];
                      return (
                        <div key={a.id} className="flex items-center justify-between py-2.5 gap-3">
                          <div className="min-w-0">
                            <p className="font-body-sm text-on-surface truncate">{a.service_name}</p>
                            <p className="font-label-caps text-[9px] text-outline">{formatDate(a.starts_at)}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`font-label-caps text-[9px] px-2 py-1 uppercase ${st.badge}`}>{st.label}</span>
                            <span className="font-body-sm text-on-surface w-16 text-right">
                              {a.status === 'confirmed' ? formatMoney(a.price ?? 0) : '—'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
            className="bg-surface w-full max-w-2xl border border-outline-variant shadow-2xl p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Neuer Kunde</h3>
              <button onClick={() => setShowAdd(false)} className="text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Anrede</label>
                <div className="flex gap-2">
                  {([
                    { v: 'herr', l: 'Herr' },
                    { v: 'frau', l: 'Frau' },
                    { v: 'keine_angabe', l: 'Keine Angabe' },
                  ] as const).map(({ v, l }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNewCustomer(p => ({ ...p, gender: v }))}
                      className={`font-label-caps text-[10px] px-3 py-1.5 transition-all ${
                        newCustomer.gender === v
                          ? 'border border-primary bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary/50'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Kategorie</label>
                  <select
                    value={newCustomer.category}
                    onChange={(e) => setNewCustomer(p => ({ ...p, category: e.target.value }))}
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="">—</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="font-body-sm text-outline -mt-2">
                Kategorie „Laser“ fragt per Mail zusätzlich die Behandlungseinwilligung an.
              </p>

              <div className="grid grid-cols-2 gap-4 items-end">
                <label className="flex items-center gap-2 font-label-caps text-[11px] text-on-surface-variant cursor-pointer select-none pb-2">
                  <input
                    type="checkbox"
                    checked={newCustomer.vip}
                    onChange={(e) => setNewCustomer(p => ({ ...p, vip: e.target.checked }))}
                  />
                  <span className="material-symbols-outlined text-[16px] text-primary">star</span>
                  VIP-Kunde
                </label>
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Klasse</label>
                  <select
                    value={newCustomer.klass}
                    onChange={(e) => setNewCustomer(p => ({ ...p, klass: e.target.value as typeof newCustomer.klass }))}
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                  >
                    <option value="">—</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
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

            {addError && <p className="font-body-sm text-error">{addError}</p>}

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
