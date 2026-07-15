'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAdminData } from '../behandlungen/AdminDataContext';
import { HERO_SLIDE_LIMIT, PROMO_BANNER_LIMIT, ABOUT_VALUE_LIMIT, REVIEW_LIMIT, FRONTEND_SLUG, type LandingContent } from '../behandlungen/data';

const SECTIONS = ['Navigation', 'Hero-Slider', 'Angebot', 'Kombi-Angebot', 'Über Uns', 'Kontakt-Texte', 'Footer'] as const;
type Section = typeof SECTIONS[number];

const VALUE_ICONS = ['verified', 'lock', 'star', 'diamond', 'favorite', 'health_and_beauty', 'auto_awesome', 'spa', 'thumb_up', 'workspace_premium'];

const INPUT_CLS = 'w-full border border-outline-variant/60 px-3 py-2 text-[13px] text-on-surface bg-white focus:border-primary focus:outline-none transition-colors font-body-md placeholder:text-outline';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider block">{label}</label>
      {children}
    </div>
  );
}

/** Manual "move to position N" input — typing 1 on the 4th slide moves it to the top,
    everyone else keeps their relative order. Uncontrolled-ish: keeps its own draft text while
    typing so the live position (which changes as `position` prop updates) doesn't fight the
    user's keystrokes, and only commits (reordering the slide) on blur/Enter. */
function PositionInput({ position, max, onCommit }: { position: number; max: number; onCommit: (pos: number) => void }) {
  const [draft, setDraft] = useState(String(position));
  useEffect(() => setDraft(String(position)), [position]);
  const commit = () => {
    const n = Math.max(1, Math.min(max, Number(draft) || position));
    setDraft(String(n));
    if (n !== position) onCommit(n);
  };
  return (
    <input
      type="number"
      min={1}
      max={max}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      className="w-14 border border-outline-variant/60 px-2 py-1 text-[12px] text-center text-on-surface bg-white focus:border-primary focus:outline-none transition-colors font-body-md"
      title="Position (verschiebt den Slide, andere rücken nach)"
    />
  );
}

/** Same draft/commit pattern as PositionInput: lets the user freely type/clear digits without
    every keystroke being clamped back to a "corrected" value mid-edit. Clamps only on blur. */
function DurationInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = Math.max(3, Math.min(60, Number(draft) || value));
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };
  return (
    <input
      type="number"
      min={3}
      max={60}
      className={INPUT_CLS}
      value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
  );
}

function ImageUpload({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {value ? (
        <div className="relative group cursor-pointer" onClick={() => ref.current?.click()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-28 w-full object-cover border border-outline-variant/30" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-primary">Ändern</span>
            <span
              className="bg-white/90 px-2 py-1 font-label-caps text-[10px] text-error cursor-pointer"
              onClick={e => { e.stopPropagation(); onChange(''); }}
            >Entfernen</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="w-full border border-dashed border-outline-variant/50 hover:border-primary/60 py-5 flex flex-col items-center gap-1 transition-colors group"
        >
          <span className="material-symbols-outlined text-[24px] text-outline group-hover:text-primary transition-colors">cloud_upload</span>
          <span className="font-label-caps text-[10px] text-outline group-hover:text-primary transition-colors">Bild hochladen</span>
        </button>
      )}
    </div>
  );
}

export default function StartseitePage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const {
    landingContent: lc, updateLandingField,
    heroSlides, updateHeroSlide, addHeroSlide, removeHeroSlide, reorderHeroSlide,
    promoBanners, updatePromoBanner, addPromoBanner, removePromoBanner,
    aboutValues, updateAboutValue, addAboutValue, removeAboutValue,
    reviews, updateReview, addReview, removeReview,
    categories,
    settings, updateSetting, updateSettingHours,
  } = useAdminData();
  const [active, setActive] = useState<Section>('Navigation');
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof LandingContent>(key: K, value: LandingContent[K]) =>
    updateLandingField(key, value);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Startseite</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">Alle Texte der öffentlichen Startseite</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/${locale}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 py-2.5 px-4 font-label-caps text-label-caps border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Vorschau
          </a>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 py-2.5 px-5 font-label-caps text-label-caps transition-all ${
              saved ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:brightness-110'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{saved ? 'check' : 'save'}</span>
            {saved ? 'Gespeichert!' : 'Speichern'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-56 shrink-0 border-r border-outline-variant bg-surface-container-low flex flex-col py-4 gap-1 px-3">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`text-left px-4 py-2.5 font-body-sm rounded-lg transition-all ${
                active === s
                  ? 'bg-secondary-container/50 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-secondary-container/30'
              }`}
              style={active === s ? { boxShadow: 'inset 3px 0 0 0 #745b00' } : {}}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* ── Navigation ───────────────────────────────── */}
          {active === 'Navigation' && (
            <section className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Navigationsleiste</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Menüpunkte und Buchen-Button oben auf der Startseite.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Menüpunkt: Behandlungen">
                    <input className={INPUT_CLS} value={lc.navBehandlungen} onChange={e => set('navBehandlungen', e.target.value)} />
                  </Field>
                  <Field label="Menüpunkt: Preise">
                    <input className={INPUT_CLS} value={lc.navPreise} onChange={e => set('navPreise', e.target.value)} />
                  </Field>
                  <Field label="Menüpunkt: Über Uns">
                    <input className={INPUT_CLS} value={lc.navUeberUns} onChange={e => set('navUeberUns', e.target.value)} />
                  </Field>
                  <Field label="Menüpunkt: Kontakt">
                    <input className={INPUT_CLS} value={lc.navKontakt} onChange={e => set('navKontakt', e.target.value)} />
                  </Field>
                </div>
                <Field label="Buchen-Button (CTA)">
                  <input className={INPUT_CLS} value={lc.navCta} onChange={e => set('navCta', e.target.value)} />
                </Field>
              </div>
            </section>
          )}

          {/* ── Hero-Slider ──────────────────────────────── */}
          {active === 'Hero-Slider' && (
            <section className="max-w-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Hero-Slider</h3>
                  <p className="font-body-sm text-on-surface-variant opacity-70">Die Story-Slides ganz oben auf der Startseite (max. {HERO_SLIDE_LIMIT}).</p>
                </div>
                <span className="font-label-caps text-[10px] text-outline shrink-0">{heroSlides.length} / {HERO_SLIDE_LIMIT}</span>
              </div>
              {heroSlides.map((slide, i) => (
                <div key={slide.id} className="bg-surface-container-lowest border border-outline-variant p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-caps text-[10px] text-primary">SLIDE</span>
                      <PositionInput
                        position={i + 1}
                        max={heroSlides.length}
                        onCommit={pos => reorderHeroSlide(slide.id, pos)}
                      />
                    </div>
                    {heroSlides.length > 1 && (
                      <button
                        onClick={() => removeHeroSlide(slide.id)}
                        className="text-outline hover:text-error transition-colors"
                        title="Slide löschen"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                      </button>
                    )}
                  </div>
                  <Field label="Headline">
                    <input
                      className={INPUT_CLS}
                      value={slide.headline}
                      onChange={e => updateHeroSlide(slide.id, 'headline', e.target.value)}
                    />
                  </Field>
                  <Field label="Subtext">
                    <textarea
                      className={`${INPUT_CLS} resize-none`}
                      rows={2}
                      value={slide.sub}
                      onChange={e => updateHeroSlide(slide.id, 'sub', e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Button-Text (CTA)">
                      <input
                        className={INPUT_CLS}
                        value={slide.cta}
                        onChange={e => updateHeroSlide(slide.id, 'cta', e.target.value)}
                      />
                    </Field>
                    <Field label="Anzeigedauer (Sekunden)">
                      <DurationInput
                        value={slide.duration}
                        onCommit={v => updateHeroSlide(slide.id, 'duration', v)}
                      />
                    </Field>
                  </div>
                  <Field label="Hintergrundbild">
                    <ImageUpload value={slide.image} onChange={v => updateHeroSlide(slide.id, 'image', v)} />
                  </Field>
                </div>
              ))}
              {heroSlides.length < HERO_SLIDE_LIMIT && (
                <button
                  onClick={addHeroSlide}
                  className="w-full border-2 border-dashed border-outline-variant py-4 flex items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary transition-all font-label-caps text-[11px]"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Slide hinzufügen
                </button>
              )}
            </section>
          )}

          {/* ── Angebot (services section) ──────────────── */}
          {active === 'Angebot' && (
            <section className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Angebot-Sektion</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Überschrift des Behandlungs-Rasters. Kategorienamen, Kurzbeschreibung (Hover-Text auf jeder Karte) &amp; Sichtbarkeit werden unter Behandlungen gepflegt.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <Field label="Label (Kicker)">
                  <input className={INPUT_CLS} value={lc.servicesSectionLabel} onChange={e => set('servicesSectionLabel', e.target.value)} />
                </Field>
                <Field label="Titel">
                  <input className={INPUT_CLS} value={lc.servicesSectionTitle} onChange={e => set('servicesSectionTitle', e.target.value)} />
                </Field>
              </div>
            </section>
          )}

          {/* ── Kombi-Angebot (promo) ────────────────────── */}
          {active === 'Kombi-Angebot' && (
            <section className="max-w-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Kombi-Angebot Banner</h3>
                  <p className="font-body-sm text-on-surface-variant opacity-70">Promo-Banner zwischen Angebot und Über-Uns-Sektion (max. {PROMO_BANNER_LIMIT}).</p>
                </div>
                <span className="font-label-caps text-[10px] text-outline shrink-0">{promoBanners.length} / {PROMO_BANNER_LIMIT}</span>
              </div>
              {promoBanners.map((banner, i) => (
                <div key={banner.id} className="bg-surface-container-lowest border border-outline-variant p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-[10px] text-primary">BANNER {i + 1}</span>
                    {promoBanners.length > 1 && (
                      <button
                        onClick={() => removePromoBanner(banner.id)}
                        className="text-outline hover:text-error transition-colors"
                        title="Banner löschen"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                      </button>
                    )}
                  </div>
                  <Field label="Label (Kicker)">
                    <input className={INPUT_CLS} value={banner.label} onChange={e => updatePromoBanner(banner.id, 'label', e.target.value)} />
                  </Field>
                  <Field label="Titel (Zeilenumbruch mit Enter)">
                    <textarea className={`${INPUT_CLS} resize-none`} rows={2} value={banner.title} onChange={e => updatePromoBanner(banner.id, 'title', e.target.value)} />
                  </Field>
                  <Field label="Beschreibung">
                    <textarea className={`${INPUT_CLS} resize-none`} rows={3} value={banner.desc} onChange={e => updatePromoBanner(banner.id, 'desc', e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Primärer Button">
                      <input className={INPUT_CLS} value={banner.ctaPrimary} onChange={e => updatePromoBanner(banner.id, 'ctaPrimary', e.target.value)} />
                    </Field>
                    <Field label="Sekundärer Button (optional)">
                      <input className={INPUT_CLS} value={banner.ctaSecondary} onChange={e => updatePromoBanner(banner.id, 'ctaSecondary', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Bild">
                    <ImageUpload value={banner.image} onChange={v => updatePromoBanner(banner.id, 'image', v)} />
                  </Field>
                </div>
              ))}
              {promoBanners.length < PROMO_BANNER_LIMIT && (
                <button
                  onClick={addPromoBanner}
                  className="w-full border-2 border-dashed border-outline-variant py-4 flex items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary transition-all font-label-caps text-[11px]"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  Banner hinzufügen
                </button>
              )}
            </section>
          )}

          {/* ── Über Uns ─────────────────────────────────── */}
          {active === 'Über Uns' && (
            <section className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Über Uns</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Text, Bild und Werte der Über-Uns-Sektion.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <Field label="Label (Kicker)">
                  <input className={INPUT_CLS} value={lc.aboutSectionLabel} onChange={e => set('aboutSectionLabel', e.target.value)} />
                </Field>
                <Field label="Titel">
                  <input className={INPUT_CLS} value={lc.aboutTitle} onChange={e => set('aboutTitle', e.target.value)} />
                </Field>
                <Field label="Beschreibung">
                  <textarea className={`${INPUT_CLS} resize-none`} rows={3} value={lc.aboutDesc} onChange={e => set('aboutDesc', e.target.value)} />
                </Field>
                <Field label="Bild">
                  <ImageUpload value={settings.aboutImage} onChange={v => updateSetting('aboutImage', v)} />
                </Field>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline-sm text-[15px] text-on-surface">Werte</h4>
                  <span className="font-label-caps text-[10px] text-outline shrink-0">{aboutValues.length} / {ABOUT_VALUE_LIMIT}</span>
                </div>
                {aboutValues.map((v, i) => (
                  <div key={v.id} className="border-t border-outline-variant/30 pt-4 first:border-t-0 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-[10px] text-primary">WERT {i + 1}</span>
                      {aboutValues.length > 1 && (
                        <button
                          onClick={() => removeAboutValue(v.id)}
                          className="text-outline hover:text-error transition-colors"
                          title="Wert löschen"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-4 items-end">
                      <Field label="Icon">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {VALUE_ICONS.map(ic => (
                            <button
                              key={ic}
                              onClick={() => updateAboutValue(v.id, 'icon', ic)}
                              className={`material-symbols-outlined text-[16px] p-1 border transition-colors ${v.icon === ic ? 'border-primary text-primary bg-primary/5' : 'border-outline-variant/40 text-outline hover:border-primary hover:text-primary'}`}
                              title={ic}
                            >
                              {ic}
                            </button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Titel">
                        <input className={INPUT_CLS} value={v.title} onChange={e => updateAboutValue(v.id, 'title', e.target.value)} />
                      </Field>
                      <Field label="Beschreibung">
                        <input className={INPUT_CLS} value={v.desc} onChange={e => updateAboutValue(v.id, 'desc', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                ))}
                {aboutValues.length < ABOUT_VALUE_LIMIT && (
                  <button
                    onClick={addAboutValue}
                    className="w-full border-2 border-dashed border-outline-variant py-3 flex items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary transition-all font-label-caps text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Wert hinzufügen
                  </button>
                )}
              </div>

              {/* ── Bewertungen (Treatwell) ────────────────── */}
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-headline-sm text-[15px] text-on-surface">Bewertungen (Treatwell)</h4>
                    <span className="font-label-caps text-[10px] text-outline shrink-0">{reviews.length} / {REVIEW_LIMIT}</span>
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant opacity-70 mt-1">
                    Erscheinen auf der Über-Uns-Seite. Kopieren Sie echte Bewertungen 1:1 aus Ihrem Treatwell-Profil.
                  </p>
                </div>
                {reviews.map((r, i) => (
                  <div key={r.id} className="border-t border-outline-variant/30 pt-4 first:border-t-0 first:pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-[10px] text-primary">BEWERTUNG {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateReview(r.id, 'active', !r.active)}
                          className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${r.active ? 'bg-primary' : 'bg-outline-variant'}`}
                          aria-label={r.active ? 'Verbergen' : 'Anzeigen'}
                          title={r.active ? 'Bewertung verbergen' : 'Bewertung anzeigen'}
                        >
                          <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                        <button
                          onClick={() => removeReview(r.id)}
                          className="text-outline hover:text-error transition-colors"
                          title="Bewertung löschen"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Name">
                        <input className={INPUT_CLS} value={r.name} onChange={e => updateReview(r.id, 'name', e.target.value)} placeholder="z.B. Amélie" />
                      </Field>
                      <Field label="Behandlung">
                        <input className={INPUT_CLS} value={r.treatment} onChange={e => updateReview(r.id, 'treatment', e.target.value)} placeholder="z.B. Laser-Haarentfernung" />
                      </Field>
                    </div>
                    <Field label="Bewertungstext">
                      <textarea className={`${INPUT_CLS} resize-none`} rows={2} value={r.text} onChange={e => updateReview(r.id, 'text', e.target.value)} />
                    </Field>
                  </div>
                ))}
                {reviews.length < REVIEW_LIMIT && (
                  <button
                    onClick={() => addReview({ name: '', text: '', treatment: '', active: true })}
                    className="w-full border-2 border-dashed border-outline-variant py-3 flex items-center justify-center gap-2 text-outline hover:text-primary hover:border-primary transition-all font-label-caps text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    Bewertung hinzufügen
                  </button>
                )}
              </div>
            </section>
          )}

          {/* ── Kontakt-Texte ────────────────────────────── */}
          {active === 'Kontakt-Texte' && (
            <section className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Kontakt-Sektion</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Überschriften, Adresse, Telefon und Öffnungszeiten der Kontakt-Sektion auf der Startseite.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <Field label="Label (Kicker)">
                  <input className={INPUT_CLS} value={lc.contactSectionLabel} onChange={e => set('contactSectionLabel', e.target.value)} />
                </Field>
                <Field label="Titel">
                  <input className={INPUT_CLS} value={lc.contactTitle} onChange={e => set('contactTitle', e.target.value)} />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Adress-Karte">
                    <input className={INPUT_CLS} value={lc.contactAddressTitle} onChange={e => set('contactAddressTitle', e.target.value)} />
                  </Field>
                  <Field label="Öffnungszeiten-Karte">
                    <input className={INPUT_CLS} value={lc.contactHoursTitle} onChange={e => set('contactHoursTitle', e.target.value)} />
                  </Field>
                  <Field label="Telefon-Karte">
                    <input className={INPUT_CLS} value={lc.contactPhoneTitle} onChange={e => set('contactPhoneTitle', e.target.value)} />
                  </Field>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <h4 className="font-headline-sm text-[15px] text-on-surface">Adresse &amp; Telefon</h4>
                <Field label="Adresse">
                  <input className={INPUT_CLS} value={settings.address} onChange={e => updateSetting('address', e.target.value)} placeholder="Musterstraße 1, 80331 München" />
                </Field>
                <Field label="Telefon">
                  <input className={INPUT_CLS} value={settings.phone} onChange={e => updateSetting('phone', e.target.value)} placeholder="+49 89 000000" />
                </Field>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant divide-y divide-outline-variant/30">
                <h4 className="font-headline-sm text-[15px] text-on-surface p-6 pb-4">Öffnungszeiten</h4>
                {settings.hours.map((d, i) => (
                  <div key={d.day} className={`flex items-center gap-4 px-6 py-4 ${d.closed ? 'opacity-50' : ''}`}>
                    <span className="font-body-md text-on-surface w-28 shrink-0">{d.day}</span>
                    <input
                      type="time"
                      className="border border-outline-variant px-2 py-1 font-body-sm text-on-surface bg-transparent focus:border-primary focus:outline-none disabled:opacity-40"
                      value={d.open}
                      disabled={d.closed}
                      onChange={e => updateSettingHours(i, 'open', e.target.value)}
                    />
                    <span className="text-outline font-body-sm">–</span>
                    <input
                      type="time"
                      className="border border-outline-variant px-2 py-1 font-body-sm text-on-surface bg-transparent focus:border-primary focus:outline-none disabled:opacity-40"
                      value={d.close}
                      disabled={d.closed}
                      onChange={e => updateSettingHours(i, 'close', e.target.value)}
                    />
                    <div className="ml-auto flex items-center gap-2">
                      <span className="font-body-sm text-outline text-[12px]">{d.closed ? 'Geschlossen' : 'Geöffnet'}</span>
                      <button
                        onClick={() => updateSettingHours(i, 'closed', !d.closed)}
                        className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors shrink-0 ${d.closed ? 'bg-outline-variant' : 'bg-primary'}`}
                      >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${d.closed ? 'translate-x-0' : 'translate-x-5'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Footer ───────────────────────────────────── */}
          {active === 'Footer' && (
            <section className="max-w-2xl space-y-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Footer</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Fußzeile der Website.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <Field label="Tagline">
                  <textarea className={`${INPUT_CLS} resize-none`} rows={2} value={lc.footerTagline} onChange={e => set('footerTagline', e.target.value)} />
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Spalte: Behandlungen">
                    <input className={INPUT_CLS} value={lc.footerBehandlungenTitle} onChange={e => set('footerBehandlungenTitle', e.target.value)} />
                  </Field>
                  <Field label="Spalte: Studio">
                    <input className={INPUT_CLS} value={lc.footerStudioTitle} onChange={e => set('footerStudioTitle', e.target.value)} />
                  </Field>
                  <Field label="Spalte: Rechtliches">
                    <input className={INPUT_CLS} value={lc.footerLegalTitle} onChange={e => set('footerLegalTitle', e.target.value)} />
                  </Field>
                </div>
                <Field label="Copyright-Zeile">
                  <input className={INPUT_CLS} value={lc.footerCopyright} onChange={e => set('footerCopyright', e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Badge 1">
                    <input className={INPUT_CLS} value={lc.footerBadge1} onChange={e => set('footerBadge1', e.target.value)} />
                  </Field>
                  <Field label="Badge 2">
                    <input className={INPUT_CLS} value={lc.footerBadge2} onChange={e => set('footerBadge2', e.target.value)} />
                  </Field>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
