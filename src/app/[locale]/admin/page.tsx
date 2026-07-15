'use client';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const KPI_CARDS = [
  { label: 'Heute', value: '12 Termine', icon: 'trending_up', sub: '+15% vs. Gestern' },
  { label: 'Gesamt Kunden', value: '1.482', icon: 'group', sub: '48 Neuregistrierungen' },
  { label: 'Aktive Services', value: '24 Behandlungen', icon: 'verified', sub: 'In 5 Kategorien' },
];


const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function AdminDashboardPage() {
  const settings = useAdminSettings();
  return (
    <>
      {/* Top App Bar */}
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Dashboard</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">Willkommen zurück, Administrator</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer">
            <span className="material-symbols-outlined text-outline hover:text-primary transition-colors">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-outline-variant">
            <div className="text-right">
              <p className="font-label-caps text-on-surface">Admin Profile</p>
              <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Premium Access</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container border border-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* KPI Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {KPI_CARDS.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface-container-lowest border border-outline-variant/50 p-6 rounded-xl flex flex-col justify-between hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="font-label-caps text-outline uppercase tracking-widest text-[10px]">{kpi.label}</p>
                <h3 className="font-headline-md text-headline-md mt-1">{kpi.value}</h3>
              </div>
              <div className="flex items-center gap-2 mt-4 text-primary">
                <span className="material-symbols-outlined text-[18px]">{kpi.icon}</span>
                <span className="font-body-sm">{kpi.sub}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Google Calendar */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <h3 className="font-headline-sm text-headline-sm">Google Calendar Integration</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-label-caps text-[10px] text-green-600">Verbunden</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl overflow-hidden flex flex-col md:flex-row h-80">
            <div className="md:w-1/3 p-8 bg-surface-container-low border-r border-outline-variant/30 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2 text-primary mb-4">
                  <span className="material-symbols-outlined">event_available</span>
                  <span className="font-label-caps uppercase tracking-widest text-[11px]">Live Sync Status</span>
                </div>
                <p className="font-body-md text-on-surface">
                  Alle Buchungen über &apos;Termin Buchen&apos; werden automatisch mit Ihrem Münchener Studio-Kalender synchronisiert.
                </p>
              </div>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 bg-white border border-outline-variant rounded hover:border-primary transition-all group">
                  <span className="font-body-sm">Kalender öffnen</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">open_in_new</span>
                </a>
                <a href="#" className="flex items-center justify-between p-3 bg-white border border-outline-variant rounded hover:border-primary transition-all group">
                  <span className="font-body-sm">Sync-Einstellungen</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:rotate-45 transition-transform">settings</span>
                </a>
              </div>
            </div>
            <div className="flex-1 bg-surface-container-low p-4 flex items-center justify-center">
              <div className="w-full h-full border border-outline-variant rounded bg-white overflow-hidden flex flex-col">
                <div className="h-10 border-b border-outline-variant/30 flex items-center px-4 justify-between bg-surface-container-low shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">arrow_back_ios</span>
                    <span className="font-label-caps text-[10px]">Juni 2026</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward_ios</span>
                  </div>
                  <span className="font-label-caps text-[10px] bg-primary/10 px-2 py-0.5 rounded text-primary">Heute</span>
                </div>
                <div className="flex-1 grid grid-cols-7 gap-px p-2 overflow-hidden">
                  {CALENDAR_DAYS.map((day) => (
                    <div
                      key={day}
                      className={`text-[10px] text-outline p-1 rounded ${day === 29 ? 'ring-2 ring-primary ring-inset' : ''}`}
                    >
                      <div>{day}</div>
                      {day === 29 && (
                        <div className="mt-0.5 bg-primary/10 text-primary text-[8px] p-0.5 rounded leading-tight">Laser</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-outline-variant flex items-center justify-between px-8 bg-surface-container-highest text-secondary font-label-caps text-[11px] shrink-0">
        <p>© 2026 {settings.name} – Luxury Beauty Care Munich | Admin Console v1.0</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-primary transition-colors">Support</a>
          <a href="#" className="hover:text-primary transition-colors">Impressum</a>
        </div>
      </footer>
    </>
  );
}
