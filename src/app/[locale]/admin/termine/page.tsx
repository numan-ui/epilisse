'use client';
import { useState } from 'react';

type Appointment = {
  id: string;
  time: string;
  duration: number; // minutes
  client: string;
  service: string;
  category: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  phone: string;
};

const TODAY = new Date(2026, 5, 29); // June 29, 2026

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

const APPOINTMENTS: Appointment[] = [
  { id: 'a1', time: '09:00', duration: 45, client: 'Aylin Kaya',       service: 'HydraFacial Basic',   category: 'Gesichtsästhetik',    status: 'confirmed', phone: '+49 176 111 222' },
  { id: 'a2', time: '10:00', duration: 30, client: 'Sophie Müller',    service: 'Botox Stirn',          category: 'Injectables',         status: 'confirmed', phone: '+49 176 333 444' },
  { id: 'a3', time: '11:00', duration: 15, client: 'Zeynep Arslan',    service: 'Oberlippe',            category: 'Laser-Haarentfernung',status: 'pending',   phone: '+49 176 555 666' },
  { id: 'a4', time: '12:30', duration: 60, client: 'Lisa Wagner',      service: 'Gel-Maniküre',         category: 'Maniküre',            status: 'confirmed', phone: '+49 176 777 888' },
  { id: 'a5', time: '14:00', duration: 90, client: 'Fatma Demir',      service: 'Beine (Komplett)',     category: 'Laser-Haarentfernung',status: 'confirmed', phone: '+49 176 999 000' },
  { id: 'a6', time: '16:00', duration: 45, client: 'Anna Schneider',   service: 'Hyaluron Lippen',      category: 'Injectables',         status: 'pending',   phone: '+49 176 100 200' },
  { id: 'a7', time: '17:00', duration: 75, client: 'Müge Yıldız',      service: 'Microneedling',        category: 'Gesichtsästhetik',    status: 'cancelled', phone: '+49 176 300 400' },
];

const STATUS_STYLES: Record<Appointment['status'], { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-primary/10',       text: 'text-primary',  label: 'Bestätigt'   },
  pending:   { bg: 'bg-amber-50',          text: 'text-amber-700',label: 'Ausstehend'  },
  cancelled: { bg: 'bg-error-container',   text: 'text-error',    label: 'Storniert'   },
};

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00–19:00

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function TerminePage() {
  const [view, setView]           = useState<'list' | 'week'>('list');
  const [currentWeek, setWeek]    = useState(() => getWeekDays(TODAY));
  const [selectedDate, setDate]   = useState(TODAY);
  const [selected, setSelected]   = useState<Appointment | null>(null);
  const [showAdd, setShowAdd]     = useState(false);

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

  const confirmed = APPOINTMENTS.filter(a => a.status === 'confirmed').length;
  const pending   = APPOINTMENTS.filter(a => a.status === 'pending').length;
  const totalMin  = APPOINTMENTS.filter(a => a.status !== 'cancelled').reduce((s, a) => s + a.duration, 0);

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
              <p className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Heute</p>
              <p className="font-headline-sm text-[16px] text-on-surface">{APPOINTMENTS.length} Termine</p>
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
            {APPOINTMENTS.map((apt) => {
              const st = STATUS_STYLES[apt.status];
              const isSelected = selected?.id === apt.id;
              return (
                <div
                  key={apt.id}
                  onClick={() => setSelected(isSelected ? null : apt)}
                  className={`group bg-surface-container-lowest border rounded-xl p-5 cursor-pointer transition-all ${
                    isSelected ? 'border-primary shadow-md' : 'border-outline-variant/60 hover:border-primary/40 hover:shadow-sm'
                  } ${apt.status === 'cancelled' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    {/* Time block */}
                    <div className="shrink-0 w-16 text-center">
                      <p className="font-headline-sm text-[18px] text-primary">{apt.time}</p>
                      <p className="font-label-caps text-[10px] text-outline">{apt.duration} min</p>
                    </div>

                    {/* Divider */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-px flex-1 bg-outline-variant/50 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-headline-sm text-[15px] text-on-surface">{apt.client}</h4>
                        <span className={`font-label-caps text-[10px] px-2 py-0.5 ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="font-body-sm text-outline mt-0.5">
                        {apt.service} · <span className="text-on-surface-variant">{apt.category}</span>
                      </p>
                    </div>

                    {/* Phone + actions */}
                    <div className="shrink-0 flex items-center gap-4">
                      <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">phone</span>
                        <span className="font-body-sm text-[13px]">{apt.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 border border-outline-variant rounded hover:border-primary hover:text-primary transition-colors"
                          title="Bearbeiten"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={(e) => e.stopPropagation()}
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
                        <p className="font-body-sm text-on-surface">{apt.phone}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Kategorie</p>
                        <p className="font-body-sm text-on-surface">{apt.category}</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Dauer</p>
                        <p className="font-body-sm text-on-surface">{apt.duration} Minuten</p>
                      </div>
                      <div>
                        <p className="font-label-caps text-[10px] text-outline uppercase mb-1">Status</p>
                        <select
                          className="font-body-sm text-on-surface bg-transparent border border-outline-variant px-2 py-1 focus:outline-none focus:border-primary"
                          defaultValue={apt.status}
                          onClick={(e) => e.stopPropagation()}
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
                        const isToday = d.toDateString() === TODAY.toDateString();
                        const dayApts = isToday
                          ? APPOINTMENTS.filter((a) => {
                              const h = timeToMinutes(a.time);
                              return h >= hour * 60 && h < (hour + 1) * 60;
                            })
                          : [];
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
                                  onClick={() => { setView('list'); setSelected(apt); }}
                                >
                                  <p className={`font-label-caps text-[9px] ${st.text} leading-tight`}>{apt.time}</p>
                                  <p className="font-body-sm text-[10px] text-on-surface leading-tight truncate">{apt.client}</p>
                                  <p className="font-label-caps text-[9px] text-outline truncate">{apt.service}</p>
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
              {[
                { label: 'Kundenname', placeholder: 'Vorname Nachname', type: 'text' },
                { label: 'Telefon',    placeholder: '+49 176 ...', type: 'tel' },
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
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Service</label>
                <select className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all">
                  <option>Oberlippe – Laser</option>
                  <option>Ganzes Gesicht – Laser</option>
                  <option>HydraFacial Basic</option>
                  <option>Botox Stirn</option>
                  <option>Gel-Maniküre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Datum</label>
                  <input
                    type="date"
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                    defaultValue="2026-06-29"
                  />
                </div>
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Uhrzeit</label>
                  <input
                    type="time"
                    className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                    defaultValue="09:00"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Notiz</label>
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
