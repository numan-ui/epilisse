'use client';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminDataProvider } from './behandlungen/AdminDataContext';

const NAV_ITEMS = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/startseite', icon: 'home', label: 'Startseite' },
  { href: '/admin/termine', icon: 'calendar_month', label: 'Termine' },
  { href: '/admin/behandlungen', icon: 'content_cut', label: 'Behandlungen' },
  { href: '/admin/kunden', icon: 'group', label: 'Kunden' },
  { href: '/admin/einstellungen', icon: 'settings', label: 'Einstellungen' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pathname = usePathname();

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    return href === '/admin' ? pathname === full : pathname.startsWith(full);
  };

  return (
    <div className="fixed inset-0 flex bg-surface text-on-surface">
      <aside className="w-[280px] h-full bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0">
        <div className="p-8 pb-6">
          <h1 className="font-headline-sm text-headline-sm text-primary tracking-widest uppercase">EPILISSE Admin</h1>
          <p className="font-label-caps text-[10px] text-outline mt-1 tracking-[0.2em] uppercase">MUNICH STUDIO</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`flex items-center gap-4 px-4 py-3 transition-all rounded-lg font-body-md ${
                isActive(item.href)
                  ? 'bg-secondary-container/50 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-secondary-container/30'
              }`}
              style={isActive(item.href) ? { boxShadow: 'inset 4px 0 0 0 #745b00' } : {}}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-outline-variant">
          <button className="w-full bg-primary text-on-primary py-3 px-4 flex items-center justify-center gap-2 rounded hover:brightness-90 transition-all active:scale-95 font-label-caps text-label-caps uppercase">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Neuer Termin
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminDataProvider>
          {children}
        </AdminDataProvider>
      </main>
    </div>
  );
}
