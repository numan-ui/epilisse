'use client';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useBookingModal } from '@/context/BookingModalContext';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { useCategoryServices, parseDurationMin } from '@/hooks/useCategoryServices';

type Step = 'category' | 'services' | 'details' | 'success';

interface AvailabilitySlot {
  time: string;
  available: boolean;
}

interface AvailabilityResponse {
  closed: boolean;
  dayLabel: string;
  slots: AvailabilitySlot[];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function ServiceStep({
  categoryId,
  selected,
  onToggle,
}: {
  categoryId: string;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const services = useCategoryServices(categoryId);

  if (services.length === 0) {
    return <p className="font-body-sm text-outline py-8 text-center">Keine Services in dieser Kategorie verfügbar.</p>;
  }

  return (
    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
      {services.map((s) => {
        const isChecked = selected.has(s.id);
        return (
          <label
            key={s.id}
            className={`flex items-center justify-between gap-4 p-4 border cursor-pointer transition-all ${
              isChecked ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(s.id)}
                className="accent-[var(--color-primary)] w-4 h-4 shrink-0"
              />
              <div className="min-w-0">
                <p className="font-body-md text-on-surface truncate">{s.name}</p>
                <p className="font-body-sm text-outline">{s.duration}</p>
              </div>
            </div>
            <span className="font-headline-sm text-[15px] text-primary shrink-0">€ {parseFloat(s.price).toFixed(2)}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function BookingModal() {
  const { isOpen, categoryId: preselectedCategory, close } = useBookingModal();
  const categories = useAdminCategories().filter((c) => c.visible);
  const params = useParams();
  const locale = (params?.locale as string) || 'de';

  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [consentDatenschutz, setConsentDatenschutz] = useState(false);
  const [consentBehandlung, setConsentBehandlung] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [dayClosed, setDayClosed] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const services = useCategoryServices(selectedCategory ?? '');

  const totalDurationMin = useMemo(() => {
    const chosen = services.filter((s) => selectedServiceIds.has(s.id));
    return chosen.reduce((sum, s) => sum + parseDurationMin(s.duration), 0) || 30;
  }, [services, selectedServiceIds]);

  useEffect(() => {
    if (step !== 'details') return;
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`/api/availability?date=${date}&durationMin=${totalDurationMin}`)
      .then((res) => res.json())
      .then((data: AvailabilityResponse) => {
        if (cancelled) return;
        setDayClosed(data.closed);
        setSlots(data.slots ?? []);
        setTime((prev) => (prev && data.slots?.some((s) => s.time === prev && s.available) ? prev : null));
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setDayClosed(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, date, totalDurationMin]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategory(preselectedCategory);
    setStep(preselectedCategory ? 'services' : 'category');
    setSelectedServiceIds(new Set());
    setName('');
    setEmail('');
    setPhone('');
    setDate(todayISO());
    setTime(null);
    setSlots([]);
    setDayClosed(false);
    setNotes('');
    setConsentDatenschutz(false);
    setConsentBehandlung(false);
    setConsentMarketing(false);
    setError(null);
  }, [isOpen, preselectedCategory]);

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === selectedCategory)?.name ?? '',
    [categories, selectedCategory]
  );

  if (!isOpen) return null;

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Bitte Name, E-Mail und Telefon angeben.');
      return;
    }
    if (selectedServiceIds.size === 0) {
      setError('Bitte mindestens einen Service auswählen.');
      return;
    }
    if (!time) {
      setError('Bitte eine Uhrzeit auswählen.');
      return;
    }
    if (!consentDatenschutz || !consentBehandlung) {
      setError('Bitte bestätigen Sie die Datenschutz- und Behandlungshinweise.');
      return;
    }
    const chosen = services.filter((s) => selectedServiceIds.has(s.id));
    // Stored literally (no local-timezone conversion) so it lines up with the
    // salon's naive wall-clock business hours / availability calculation.
    const startsAt = `${date}T${time}:00.000Z`;

    setSubmitting(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          categoryId: selectedCategory,
          services: chosen.map((s) => ({
            name: s.name,
            price: parseFloat(s.price) || null,
            durationMin: parseDurationMin(s.duration),
          })),
          startsAt,
          notes,
          consentDatenschutz,
          consentBehandlung,
          consentMarketing,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.');
        return;
      }
      setStep('success');
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={close}
    >
      <div
        className="bg-surface w-full max-w-lg border border-outline-variant shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Termin Buchen</h3>
          <button onClick={close} className="text-outline hover:text-error transition-colors" aria-label="Schließen">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {step === 'category' && (
          <div className="space-y-2">
            <p className="font-body-sm text-secondary mb-4">Wählen Sie eine Kategorie</p>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setSelectedServiceIds(new Set());
                    setStep('services');
                  }}
                  className="flex flex-col items-center gap-2 p-5 border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all text-center"
                >
                  <span className="material-symbols-outlined text-primary text-[28px]">{c.icon}</span>
                  <span className="font-body-sm text-on-surface">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'services' && selectedCategory && (
          <div>
            <button
              onClick={() => (preselectedCategory ? close() : setStep('category'))}
              className="font-label-caps text-[11px] text-outline hover:text-primary transition-colors mb-4 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              {preselectedCategory ? 'Abbrechen' : 'Zurück'}
            </button>
            <p className="font-body-sm text-secondary mb-4">
              {selectedCategoryName} — wählen Sie ein oder mehrere Services
            </p>
            <ServiceStep categoryId={selectedCategory} selected={selectedServiceIds} onToggle={toggleService} />
            <button
              disabled={selectedServiceIds.size === 0}
              onClick={() => setStep('details')}
              className="w-full mt-6 bg-primary text-on-primary py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter ({selectedServiceIds.size} ausgewählt)
            </button>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('services')}
              className="font-label-caps text-[11px] text-outline hover:text-primary transition-colors mb-2 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Zurück
            </button>

            <div>
              <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">E-Mail *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Telefon *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Datum</label>
              <input
                type="date"
                min={todayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-label-caps text-[10px] text-outline uppercase block mb-2">Uhrzeit</label>
              {loadingSlots && <p className="font-body-sm text-outline">Lädt…</p>}
              {!loadingSlots && dayClosed && (
                <p className="font-body-sm text-error">Studio an diesem Tag geschlossen — bitte anderes Datum wählen.</p>
              )}
              {!loadingSlots && !dayClosed && slots.length > 0 && slots.every((s) => !s.available) && (
                <p className="font-body-sm text-error">Keine freien Termine an diesem Tag.</p>
              )}
              {!loadingSlots && !dayClosed && slots.some((s) => s.available) && (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setTime(s.time)}
                      className={`py-2 text-center font-body-sm border transition-all ${
                        time === s.time
                          ? 'border-primary bg-primary text-on-primary'
                          : s.available
                            ? 'border-outline-variant text-on-surface hover:border-primary/40'
                            : 'border-outline-variant text-outline opacity-40 cursor-not-allowed line-through'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="font-label-caps text-[10px] text-outline uppercase block mb-1">Notiz (optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-outline-variant/50">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentDatenschutz}
                  onChange={(e) => setConsentDatenschutz(e.target.checked)}
                  className="accent-[var(--color-primary)] w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="font-body-sm text-secondary">
                  Ich stimme der{' '}
                  <a
                    href={`/${locale}/datenschutz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Datenschutzerklärung
                  </a>{' '}
                  zu. *
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentBehandlung}
                  onChange={(e) => setConsentBehandlung(e.target.checked)}
                  className="accent-[var(--color-primary)] w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="font-body-sm text-secondary">
                  Ich habe die{' '}
                  <a
                    href={`/${locale}/behandlungseinwilligung`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Behandlungseinwilligung
                  </a>{' '}
                  gelesen und stimme der Behandlung zu. *
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentMarketing}
                  onChange={(e) => setConsentMarketing(e.target.checked)}
                  className="accent-[var(--color-primary)] w-4 h-4 mt-0.5 shrink-0"
                />
                <span className="font-body-sm text-secondary">
                  Ich möchte per E-Mail über Angebote und Aktionen informiert werden (optional).
                </span>
              </label>
            </div>

            {error && <p className="font-body-sm text-error">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !time || dayClosed || !consentDatenschutz || !consentBehandlung}
              className="w-full bg-primary text-on-primary py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all disabled:opacity-60"
            >
              {submitting ? 'Wird gesendet…' : 'Termin anfragen'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-6 space-y-4">
            <span className="material-symbols-outlined text-primary text-[56px]">check_circle</span>
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Anfrage erhalten!</h4>
            <p className="font-body-sm text-secondary">
              Vielen Dank, {name}. Wir melden uns in Kürze zur Bestätigung Ihres Termins.
            </p>
            <button
              onClick={close}
              className="mt-4 bg-primary text-on-primary px-8 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
            >
              Schließen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
