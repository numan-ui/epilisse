'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';

type State =
  | { step: 'loading' }
  | { step: 'invalid' }
  | { step: 'form'; name: string; requiresBehandlung: boolean; grantedDatenschutz: boolean; grantedBehandlung: boolean }
  | { step: 'done' };

export default function ConsentForm() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const customerId = searchParams.get('c') ?? '';
  const token = searchParams.get('t') ?? '';

  const [state, setState] = useState<State>({ step: 'loading' });
  const [datenschutz, setDatenschutz] = useState(false);
  const [behandlung, setBehandlung] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId || !token) { setState({ step: 'invalid' }); return; }
    fetch(`/api/consent?customerId=${customerId}&token=${token}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setDatenschutz(!!data.datenschutz);
        setBehandlung(!!data.behandlung);
        setMarketing(!!data.marketing);
        setState({
          step: 'form',
          name: data.name,
          requiresBehandlung: !!data.requiresBehandlung,
          grantedDatenschutz: !!data.datenschutz,
          grantedBehandlung: !!data.behandlung,
        });
      })
      .catch(() => setState({ step: 'invalid' }));
  }, [customerId, token]);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, token, datenschutz, behandlung, marketing }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Etwas ist schiefgelaufen.');
      return;
    }
    setState({ step: 'done' });
  };

  if (state.step === 'loading') {
    return <p className="font-body-md text-secondary">Lädt…</p>;
  }

  if (state.step === 'invalid') {
    return (
      <p className="font-body-md text-secondary">
        Dieser Link ist ungültig oder abgelaufen. Bitte kontaktieren Sie uns direkt, falls Sie Ihre Einwilligung bestätigen möchten.
      </p>
    );
  }

  if (state.step === 'done') {
    return (
      <p className="font-body-md text-secondary">
        Vielen Dank! Ihre Einwilligung wurde gespeichert.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="font-body-md text-secondary">
        Liebe/r {state.name}, bitte bestätigen Sie hier Ihre Einwilligung.
      </p>

      <div className="space-y-4">
        <label className={`flex items-start gap-3 ${state.grantedDatenschutz ? '' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={datenschutz}
            disabled={state.grantedDatenschutz}
            onChange={(e) => setDatenschutz(e.target.checked)}
            className="accent-[var(--color-primary)] w-4 h-4 mt-0.5 shrink-0 disabled:opacity-70"
          />
          <span className="font-body-sm text-on-surface">
            Ich stimme der <Link href={`/${locale}/datenschutz`} className="underline hover:text-primary" target="_blank">Datenschutzerklärung</Link> zu. *
            {state.grantedDatenschutz && <span className="text-primary"> — bereits erteilt</span>}
          </span>
        </label>

        {state.requiresBehandlung && (
          <label className={`flex items-start gap-3 ${state.grantedBehandlung ? '' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={behandlung}
              disabled={state.grantedBehandlung}
              onChange={(e) => setBehandlung(e.target.checked)}
              className="accent-[var(--color-primary)] w-4 h-4 mt-0.5 shrink-0 disabled:opacity-70"
            />
            <span className="font-body-sm text-on-surface">
              Ich habe die <Link href={`/${locale}/behandlungseinwilligung`} className="underline hover:text-primary" target="_blank">Behandlungseinwilligung</Link> gelesen und stimme der Behandlung zu. *
              {state.grantedBehandlung && <span className="text-primary"> — bereits erteilt</span>}
            </span>
          </label>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            className="accent-[var(--color-primary)] w-4 h-4 mt-0.5 shrink-0"
          />
          <span className="font-body-sm text-on-surface">
            Ich möchte per E-Mail über Angebote und Aktionen informiert werden (optional).
          </span>
        </label>
      </div>

      {error && <p className="font-body-sm text-error">{error}</p>}

      <button
        type="button"
        disabled={!datenschutz || (state.requiresBehandlung && !behandlung) || submitting}
        onClick={submit}
        className="bg-primary text-on-primary py-3 px-6 font-label-caps text-label-caps hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Wird gespeichert…' : 'Einwilligung bestätigen'}
      </button>
    </div>
  );
}
