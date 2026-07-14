'use client';
import { useEffect, useState, useCallback } from 'react';

type TeamMember = {
  id: string;
  email: string;
  role: 'super_admin' | 'admin';
  createdAt: string;
  lastSignInAt: string | null;
};

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/team');
    if (res.ok) setTeam(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, role: newRole }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Anlegen.');
      return;
    }
    setNotice(`${data.email} wurde angelegt. Einmalpasswort: ${data.password}`);
    setNewEmail('');
    setNewRole('admin');
    load();
  };

  const handleResetPassword = async (member: TeamMember) => {
    if (!confirm(`Passwort von ${member.email} zurücksetzen?`)) return;
    const res = await fetch(`/api/admin/team/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-password' }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Fehler.'); return; }
    setNotice(`Neues Passwort für ${member.email}: ${data.password}`);
  };

  const handleToggleRole = async (member: TeamMember) => {
    const newRole = member.role === 'super_admin' ? 'admin' : 'super_admin';
    if (!confirm(`${member.email} zu "${newRole === 'super_admin' ? 'Super-Admin' : 'Admin'}" machen?`)) return;
    const res = await fetch(`/api/admin/team/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set-role', role: newRole }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Fehler.'); return; }
    load();
  };

  const handleRemove = async (member: TeamMember) => {
    if (!confirm(`${member.email} wirklich entfernen? Diese Person kann sich danach nicht mehr anmelden.`)) return;
    const res = await fetch(`/api/admin/team/${member.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Fehler.'); return; }
    load();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-20 border-b border-outline-variant/30 flex items-center px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <h2 className="font-headline-md text-headline-md text-on-surface">Team-Verwaltung</h2>
      </header>

      <div className="p-8 max-w-3xl space-y-8">
        {notice && (
          <div className="bg-primary/10 border border-primary/30 p-4 font-body-sm text-body-sm">
            {notice}
            <button type="button" onClick={() => setNotice('')} className="ml-3 text-primary underline">Ausblenden</button>
          </div>
        )}
        {error && (
          <div className="bg-error/10 border border-error/30 p-4 font-body-sm text-body-sm text-error">{error}</div>
        )}

        <form onSubmit={handleAdd} className="bg-surface-container-lowest border border-outline-variant/30 p-6 flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block font-label-caps text-label-caps text-secondary mb-2">Neue E-Mail</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border border-outline-variant/50 px-4 py-3 font-body-md bg-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-secondary mb-2">Rolle</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'super_admin')}
              className="border border-outline-variant/50 px-4 py-3 font-body-md bg-surface focus:outline-none focus:border-primary"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super-Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest uppercase hover:bg-primary-container transition-all disabled:opacity-60"
          >
            {adding ? 'Wird angelegt…' : 'Hinzufügen'}
          </button>
        </form>

        <div className="bg-surface-container-lowest border border-outline-variant/30">
          {loading ? (
            <p className="p-6 font-body-sm text-body-sm text-secondary">Lädt…</p>
          ) : (
            team.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 px-6 py-4 border-b border-outline-variant/20 last:border-0">
                <div>
                  <p className="font-body-md text-on-surface">{m.email}</p>
                  <p className="font-label-caps text-[11px] text-secondary uppercase tracking-widest mt-1">
                    {m.role === 'super_admin' ? 'Super-Admin' : 'Admin'}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button type="button" onClick={() => handleToggleRole(m)} className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors">
                    {m.role === 'super_admin' ? 'Zu Admin machen' : 'Zu Super-Admin machen'}
                  </button>
                  <button type="button" onClick={() => handleResetPassword(m)} className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors">
                    Passwort zurücksetzen
                  </button>
                  <button type="button" onClick={() => handleRemove(m)} className="font-label-caps text-label-caps text-error hover:brightness-75 transition-all">
                    Entfernen
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
