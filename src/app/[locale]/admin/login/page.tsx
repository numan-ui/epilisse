'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Gib zuerst deine E-Mail-Adresse ein, dann klicke erneut auf "Passwort vergessen?".');
      return;
    }
    setError('');
    await fetch('/api/admin/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setResetSent(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = supabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError('E-Mail oder Passwort ist falsch.');
      return;
    }
    router.push(`/${locale}/admin`);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(197,160,33,0.10), transparent 70%)' }}
      />

      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant/30 lux-shadow p-10">
        <div className="text-center mb-9">
          <div className="font-display-lg text-[30px] tracking-wide epilisse-logo inline-block mb-3">
            EPILISSE
          </div>
          <p className="font-label-caps text-[11px] text-secondary tracking-[0.2em] uppercase">Admin-Bereich</p>
        </div>

        <label className="block font-label-caps text-label-caps text-secondary mb-2">E-Mail</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-outline-variant/50 px-4 py-3 mb-5 font-body-md bg-surface focus:outline-none focus:border-primary transition-colors"
        />

        <label className="block font-label-caps text-label-caps text-secondary mb-2">Passwort</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-outline-variant/50 px-4 py-3 mb-6 font-body-md bg-surface focus:outline-none focus:border-primary transition-colors"
        />

        {error && (
          <p className="font-body-sm text-body-sm text-error mb-4">{error}</p>
        )}
        {resetSent && (
          <p className="font-body-sm text-body-sm text-secondary mb-4">
            Der Super-Admin wurde benachrichtigt und wird dein Passwort zurücksetzen.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary py-4 font-label-caps text-label-caps tracking-widest uppercase hover:bg-primary-container transition-all disabled:opacity-60 lux-shadow"
        >
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="w-full text-center font-body-sm text-body-sm text-secondary hover:text-primary transition-colors mt-4"
        >
          Passwort vergessen?
        </button>

        <p className="text-center font-body-sm text-body-sm text-secondary/70 mt-6">
          Nur für autorisierte Mitarbeiter von EPILISSE.
        </p>
      </form>
    </div>
  );
}
