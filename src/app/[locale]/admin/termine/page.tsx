'use client';
import { useState, useEffect, useCallback } from 'react';
import { CustomerPicker, type PickableCustomer } from '@/components/admin/CustomerPicker';

type Appointment = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  categoryId: string;
  categoryName: string;
  serviceName: string;
  price: number | null;
  startsAt: string; // ISO
  durationMin: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
};

type Category = { id: string; name: string };

const TODAY = new Date();

function getWeekDays(base: Date): Date[] {
  const monday = new Date(base);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const DE_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

const STATUS_STYLES: Record<Appointment['status'], { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-primary/10',       text: 'text-primary',  label: 'Bestätigt'   },
  pending:   { bg: 'bg-amber-50',          text: 'text-amber-700',label: 'Ausstehend'  },
  cancelled: { bg: 'bg-error-container',   text: 'text-error',    label: 'Storniert'   },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00–19:00

function timeOf(iso: string) {
  return new Date(iso).toTimeString().slice(0, 5);
}
function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function isSameDay(iso: string, d: Date) {
  return new Date(iso).toDateString() === d.toDateString();
}

const EMPTY_NEW_APPT = { customerId: '', categoryId: '', serviceName: '', date: TODAY.toISOString().slice(0, 10), time: '09:00', durationMin: 30, notes: '' };

export default function TerminePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers]       = useState<PickableCustomer[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);

  const [view, setView]           = useState<'list' | 'week'>('list');
  const [currentWeek, setWeek]    = useState(() => getWeekDays(TODAY));
  const [selectedDate, setDate]   = useState(TODAY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [newAppt, setNewAppt]     = useState(EMPTY_NEW_APPT);

  const loadAppointments = useCallback(() => {
    setLoading(true);
    fetch('/api/appointments')
      .then(r => r.json())
      .then(setAppointments)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAppointments();
    fetch('/api/customers').then(r => r.json()).then(setCustomers);
    fetch('/api/categories').then(r => r.json()).then(setCategories);
  }, [loadAppointments]);

  const dayAppointments = appointments.filter(a => isSameDay(a.startsAt, selectedDate));

  const weekLabel = (() => {
    const from = currentWeek[0];
    const to   = currentWeek[6];
    if (from.getMonth() === to.getMonth())
      return `${from.getDate()}. – ${to.getDate()}. ${DE_MONTHS[from.getMonth()]} ${from.getFullYear()}`;
    return `${from.getDate()}. ${DE_MONTHS[from.getMonth()]} – ${to.getDate()}. ${DE_MONTHS[to.getMonth()]} ${to.getFullYear()}`;
  })();

  const prevWeek = () => setWeek(w => getWeekDays(new Date(w[0].getTime() - 7 * 86400000)));
  const nextWeek = () => setWeek(w => getWeekDays(new Date(w[0].getTime() + 7 * 86400000)));
  const goToday  = () => { setWeek(getWeekDays(TODAY)); setDate(TODAY); };

  const confirmed = dayAppointments.filter(a => a.status === 'confirmed').length;
  const pending   = dayAppointments.filter(a => a.status === 'pending').length;
  const totalMin  = dayAppointments.filter(a => a.status !== 'cancelled').reduce((s, a) => s + a.durationMin, 0);

  const updateStatus = async (id: string, status: Appointment['status']) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const deleteAppointment = async (id: string) => {
    if (!window.confirm('Termin wirklich löschen?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    setAppointments(prev => prev.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const createAppointment = async () => {
    if (!newAppt.customerId || !newAppt.categoryId || !newAppt.serviceName.trim()) return;
    const startsAt = new Date(`${newAppt.date}T${newAppt.time}:00`).toISOString();
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: newAppt.customerId,
        categoryId: newAppt.categoryId,
        serviceName: newAppt.serviceName,
        startsAt,
        durationMin: newAppt.durationMin,
        notes: newAppt.notes,
      }),
    });
    if (res.ok) {
      loadAppointments();
      setNewAppt(EMPTY_NEW_APPT);
      setShowAdd(false);
    }
  };

  return (
    <>
      {/* Top bar */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Termine</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">
            {selectedDate.getDate()}. {DE_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-surface-container-high p-1 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-caps text-[11px] transition-all ${view === 'list' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              Liste
            </button>
            <button
              onClick={() => setView('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label-caps text-[11px] transition-all ${view === 'week' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_view_week</span>
              Woche
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary text-on-primary py-2.5 px-5 font-label-caps text-label-caps hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Neuer Termin
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">

        {/* ── KPI strip ───────────────────────────────────────── */}
        <div className="flex items-center gap-6 px-8 py-4 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">event</span>
            <div>
              <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Ausgewählter Tag</p>
              <p className="font-headline-sm text-[16px] text-on-surface">{dayAppointments.length} Termine</p>
            </div>
          </div>
          <div className="w-px h-8 bg-outline-variant" />
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            <div>
              <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Bestätigt</p>
              <p className="font-headline-sm text-[16px] text-on-surface">{confirmed}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-outline-variant" />
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[20px]">schedule</span>
            <div>
              <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Ausstehend</p>
              <p className="font-headline-sm text-[16px] text-on-surface">{pending}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-outline-variant" />
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <div>
              <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Gesamtzeit</p>
              <p className="font-headline-sm text-[16px] text-on-surface">{Math.floor(totalMin / 60)}h {totalMin % 60}min</p>
            </div>
          </div>
        </div>

        {/* ── LIST VIEW ───────────────────────────────────────── */}
        {view === 'list' && (
          <div className="flex-1 overflow-y-auto p-8 space-y-3">
            {loading && <p className="text-center font-body-sm text-outline">Lädt…</p>}
            {!loading && dayAppointments.length === 0 && (
              <p className="text-center font-body-sm text-outline py-16">Keine Termine an diesem Tag.</p>
            )}
            {dayAppointments.map((apt) => {
              const st = STATUS_STYLES[apt.status];
              const isSelected = selectedId === apt.id;
              return (
                <div
                  key={apt.id}
                  onClick={() => setSelectedId(isSelected ? null : apt.id)}
                  className={`group bg-surface-container-lowest border rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected ? 'border-primary shadow-md' : 'border-outline-variant/60 hover:border-primary/40 hover:shadow-sm'
                  } ${apt.status === 'cancelled' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    {/* Time block */}
                    <div className="shrink-0 w-16 text-center">
                      <p className="font-headline-sm text-[18px] text-primary">{timeOf(apt.startsAt)}</p>
                      <p className="font-label-caps text-[10px] text-outline">{apt.durationMin} min</p>
                    </div>

                    {/* Divider */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-px flex-1 bg-outline-variant/50 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-headline-sm text-[15px] text-on-surface">{apt.customerName}</h4>
                        <span className={`font-label-caps text-[10px] px-2 py-0.5 ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="font-body-sm text-outline mt-0.5">
                        {apt.serviceName} · <span className="text-on-surface-variant">{apt.categoryName}</span>
                      </p>
                    </div>

                    {/* Phone + actions */}
                    <div className="shrink-0 flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                        <span className="font-body-sm text-[13px]">{apt.customerPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteAppointment(apt.id); }}
                          className="p-1.5 border border-outline-variant rounded hover:border-error hover:text-error transition-colors"
                          title="Löschen"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                        </button>
                      </div>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px]">
                        {isSelected ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Telefon</p>
                        <p className="font-body-sm text-on-surface">{apt.customerPhone}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Kategorie</p>
                        <p className="font-body-sm text-on-surface">{apt.categoryName}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Dauer</p>
                        <p className="font-body-sm text-on-surface">{apt.durationMin} Minuten</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Status</p>
                        <select
                          className="font-body-sm text-on-surface bg-transparent border border-outline-variant px-2 py-1 focus:outline-none focus:border-primary"
                          value={apt.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(apt.id, e.target.value as Appointment['status'])}
                        >
                          <option value="confirmed">Bestätigt</option>
                          <option value="pending">Ausstehend</option>
                          <option value="cancelled">Storniert</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── WEEK VIEW ───────────────────────────────────────── */}
        {view === 'week' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Week navigation */}
            <div className="flex items-center justify-between px-8 py-3 border-b border-outline-variant/30 bg-surface-container-low shrink-0">
              <button onClick={prevWeek} className="p-1.5 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back_ios</span>
              </button>
              <div className="flex items-center gap-4">
                <span className="font-body-md text-on-surface">{weekLabel}</span>
                <button
                  onClick={goToday}
                  className="font-label-caps text-[11px] bg-primary/10 text-primary px-3 py-1 hover:bg-primary/20 transition-colors"
                >
                  Heute
                </button>
              </div>
              <button onClick={nextWeek} className="p-1.5 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
              </button>
            </div>

            {/* Calendar grid */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-[700px] flex flex-col h-full">
                {/* Day headers */}
                <div className="grid border-b border-outline-variant/30 shrink-0" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                  <div className="border-r border-outline-variant/20" />
                  {currentWeek.map((d, i) => {
                    const isToday = d.toDateString() === TODAY.toDateString();
                    return (
                      <div
                        key={i}
                        className={`py-3 text-center border-r border-outline-variant/20 cursor-pointer ${isToday ? 'bg-primary/5' : 'hover:bg-surface-container-low'} transition-colors`}
                        onClick={() => setDate(d)}
                      >
                        <p className="font-label-caps text-[10px] text-outline uppercase">{DE_DAYS[i]}</p>
                        <div className={`mx-auto mt-1 w-7 h-7 flex items-center justify-center rounded-full font-body-md ${isToday ? 'bg-primary text-on-primary' : 'text-on-surface'}`}>
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                <div className="flex-1 overflow-y-auto">
                  {HOURS.map((hour) => (
                    <div key={hour} className="grid border-b border-outline-variant/10 min-h-[52px]" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                      <div className="border-r border-outline-variant/20 px-2 py-1 text-right shrink-0">
                        <span className="font-label-caps text-[10px] text-outline">{String(hour).padStart(2,'0')}:00</span>
                      </div>
                      {currentWeek.map((d, di) => {
                        const dayApts = appointments.filter((a) => {
                          if (!isSameDay(a.startsAt, d)) return false;
                          const h = timeToMinutes(timeOf(a.startsAt));
                          return h >= hour * 60 && h < (hour + 1) * 60;
                        });
                        const isToday = d.toDateString() === TODAY.toDateString();
                        return (
                          <div
                            key={di}
                            className={`border-r border-outline-variant/20 p-1 relative ${isToday ? 'bg-primary/[0.02]' : ''}`}
                          >
                            {dayApts.map((apt) => {
                              const st = STATUS_STYLES[apt.status];
                              return (
                                <div
                                  key={apt.id}
                                  className={`${st.bg} border-l-2 border-primary px-1.5 py-1 mb-1 cursor-pointer hover:brightness-95 transition-all`}
                                  onClick={() => { setView('list'); setDate(d); setSelectedId(apt.id); }}
                                >
                                  <p className={`font-label-caps text-[9px] ${st.text} leading-tight`}>{timeOf(apt.startsAt)}</p>
                                  <p className="font-body-sm text-[10px] text-on-surface leading-tight truncate">{apt.customerName}</p>
                                  <p className="font-label-caps text-[9px] text-outline truncate">{apt.serviceName}</p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Appointment Modal ──────────────────────────────── */}
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
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Neuer Termin</h3>
              <button onClick={() => setShowAdd(false)} className="text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Kundin</label>
                <CustomerPicker
                  customers={customers}
                  value={newAppt.customerId ? [newAppt.customerId] : []}
                  onChange={(ids) => setNewAppt(p => ({ ...p, customerId: ids[0] ?? '' }))}
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Kategorie</label>
                <select
                  value={newAppt.categoryId}
                  onChange={(e) => setNewAppt(p => ({ ...p, categoryId: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                >
                  <option value="">Wählen…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Service</label>
                <input
                  type="text"
                  placeholder="z.B. Oberlippe – Laser"
                  value={newAppt.serviceName}
                  onChange={(e) => setNewAppt(p => ({ ...p, serviceName: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Datum</label>
                  <input
                    type="date"
                    value={newAppt.date}
                    onChange={(e) => setNewAppt(p => ({ ...p, date: e.target.value }))}
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Uhrzeit</label>
                  <input
                    type="time"
                    value={newAppt.time}
                    onChange={(e) => setNewAppt(p => ({ ...p, time: e.target.value }))}
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Dauer (Minuten)</label>
                <input
                  type="number"
                  min={5}
                  step={5}
                  value={newAppt.durationMin}
                  onChange={(e) => setNewAppt(p => ({ ...p, durationMin: Number(e.target.value) || 30 }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Notiz</label>
                <textarea
                  rows={2}
                  placeholder="Besondere Hinweise..."
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 bg-primary text-on-primary py-3 font-label-caps text-label-caps hover:brightness-110 transition-all"
                onClick={createAppointment}
              >
                Termin speichern
              </button>
              <button
                className="px-4 border border-outline-variant text-on-surface-variant hover:border-error hover:text-error transition-all font-label-caps text-label-caps"
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
