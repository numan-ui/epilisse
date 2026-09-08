'use client';
import { useMemo } from 'react';
import { useAdminData } from '../behandlungen/AdminDataContext';
import { AKTION_CATEGORY_LIMIT, AKTION_HOME_LIMIT } from '../behandlungen/data';
import { AktionCard } from './AktionCard';

export default function AdminAktionenPage() {
  const { aktionen, categories, updateAktion, addAktion, removeAktion } = useAdminData();

  const homeCount = useMemo(
    () => aktionen.filter(a => a.activeInCategory && a.activeOnHome).length,
    [aktionen],
  );

  return (
    <div className="max-w-4xl space-y-10 pb-24">
      <header>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Aktionen</h2>
        <p className="font-body-sm text-on-surface-variant opacity-70">
          Alle Kombi-Pakete &amp; Angebote. Pro Kategorie max. {AKTION_CATEGORY_LIMIT},
          auf der Startseite max. {AKTION_HOME_LIMIT} ({homeCount} aktiv).
          Eine Aktion, die im Kategoriebereich inaktiv ist, erscheint auch auf der
          Startseite und unter /aktionen nicht.
        </p>
      </header>

      {categories.map(cat => {
        const rows = aktionen.filter(a => a.category === cat.id);
        const catFull = rows.length >= AKTION_CATEGORY_LIMIT;
        return (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
              <h3 className="font-headline-sm text-[18px] text-on-surface">
                {cat.name}{' '}
                <span className="text-outline text-[13px]">({rows.length}/{AKTION_CATEGORY_LIMIT})</span>
              </h3>
              <button
                type="button"
                disabled={catFull}
                onClick={() => addAktion(cat.id)}
                className="font-label-caps text-[11px] text-primary border-b border-primary pb-0.5 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                + Neue Aktion
              </button>
            </div>

            {rows.length === 0 && (
              <p className="font-body-sm text-outline opacity-60">Noch keine Aktion in dieser Kategorie.</p>
            )}

            {rows.map(a => (
              <AktionCard
                key={a.id}
                a={a}
                homeLocked={!a.activeOnHome && homeCount >= AKTION_HOME_LIMIT}
                onField={(f, v) => updateAktion(a.id, f, v)}
                onRemove={() => removeAktion(a.id)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
