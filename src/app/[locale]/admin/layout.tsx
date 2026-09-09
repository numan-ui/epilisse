'use client';
import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminDataProvider } from './behandlungen/AdminDataContext';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useAdminSettings } from '@/hooks/useAdminSettings';

const NAV_ITEMS = [
  { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/startseite', icon: 'home', label: 'Startseite' },
  { href: '/admin/termine', icon: 'calendar_month', label: 'Termine' },
  { href: '/admin/behandlungen', icon: 'content_cut', label: 'Behandlungen' },
  { href: '/admin/aktionen', icon: 'sell', label: 'Aktionen' },
  { href: '/admin/kunden', icon: 'group', label: 'Kunden' },
  { href: '/admin/kampagnen', icon: 'campaign', label: 'Kampagnen' },
  { href: '/admin/einstellungen', icon: 'settings', label: 'Einstellungen' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<'super_admin' | 'admin' | null>(null);
  const [email, setEmail] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);
  const settings = useAdminSettings();

  useEffect(() => {
    try { setCollapsed(localStorage.getItem('epilisse_admin_nav_collapsed') === '1'); } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      try { localStorage.setItem('epilisse_admin_nav_collapsed', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  const isLoginPage = pathname.startsWith(`/${locale}/admin/login`);

  useEffect(() => {
    if (isLoginPage) return;
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setRole((data.user?.app_metadata?.role as 'super_admin' | 'admin' | undefined) ?? 'admin');
      setEmail(data.user?.email ?? '');
    });
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = role === 'super_admin'
    ? [...NAV_ITEMS, { href: '/admin/team', icon: 'admin_panel_settings', label: 'Team' }]
    : NAV_ITEMS;

  const isActive = (href: string) => {
    const full = `/${locale}${href}`;
    return href === '/admin' ? pathname === full : pathname.startsWith(full);
  };

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    router.push(`/${locale}/admin/login`);
  };

  return (
    <div className="fixed inset-0 flex bg-surface text-on-surface" spellCheck={false}>
      <aside className={`${collapsed ? 'w-20' : 'w-[280px]'} h-full bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0 transition-[width] duration-200`}>
        <div className={`flex items-start justify-between gap-2 ${collapsed ? 'p-4 pb-3' : 'p-8 pb-6'}`}>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="font-headline-sm text-headline-sm text-primary tracking-wide font-bold uppercase truncate">{settings.name} Admin</h1>
              <p className="font-label-caps text-[10px] text-outline mt-1 tracking-[0.2em] uppercase">MUNICH STUDIO</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary hover:bg-secondary-container/30 transition-colors"
            aria-label={collapsed ? 'Menü ausklappen' : 'Menü einklappen'}
            title={collapsed ? 'Menü ausklappen' : 'Menü einklappen'}
          >
            <span className="material-symbols-outlined text-[20px]">{collapsed ? 'menu' : 'menu_open'}</span>
          </button>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-4 px-4 py-3 transition-all rounded-lg font-body-md ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive(item.href)
                  ? 'bg-secondary-container/50 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-secondary-container/30'
              }`}
              style={isActive(item.href) && !collapsed ? { boxShadow: 'inset 4px 0 0 0 #745b00' } : {}}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className={`border-t border-outline-variant space-y-3 ${collapsed ? 'p-3' : 'p-6'}`}>
          <Link
            href={`/${locale}/admin/termine`}
            title={collapsed ? 'Neuer Termin' : undefined}
            className="w-full bg-primary text-on-primary py-3 px-4 flex items-center justify-center gap-2 rounded hover:brightness-90 transition-all active:scale-95 font-label-caps text-label-caps uppercase"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {!collapsed && 'Neuer Termin'}
          </Link>

          <div className={`flex items-center gap-2 pt-1 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate" title={email}>{email}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
              aria-label="Abmelden"
              title="Abmelden"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
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
