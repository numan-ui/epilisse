'use client';
import { useRef } from 'react';
import { useAdminData } from '../behandlungen/AdminDataContext';

const SECTIONS = ['Studio-Informationen', 'Öffnungszeiten', 'Online-Buchung', 'Social Media', 'Startseite Bilder', 'Darstellung'] as const;
type Section = typeof SECTIONS[number];

import { useState } from 'react';

export default function EinstellungenPage() {
  const { settings, updateSetting, updateSettingHours } = useAdminData();
  const [active, setActive] = useState<Section>('Studio-Informationen');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <header className="h-20 border-b border-outline-variant/30 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Einstellungen</h2>
          <span className="text-outline-variant">|</span>
          <p className="font-body-sm text-secondary">Studio-Konfiguration &amp; Integrationen</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 py-3 px-6 font-label-caps text-label-caps transition-all ${
            saved ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:brightness-110'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'save'}</span>
          {saved ? 'Gespeichert!' : 'Speichern'}
        </button>
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

          {/* ── Studio-Informationen ──────────────────────── */}
          {active === 'Studio-Informationen' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Studio-Informationen</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Grunddaten Ihres Salons — erscheinen auf der Website und in Buchungsbestätigungen.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                {[
                  { label: 'Studio-Name',   key: 'name'     as const, placeholder: 'EPILISSE Beauty Studio' },
                  { label: 'Slogan',        key: 'tagline'  as const, placeholder: 'Luxury Beauty Care Munich' },
                  { label: 'Adresse',       key: 'address'  as const, placeholder: 'Musterstraße 1, 80331 München' },
                  { label: 'Telefon',       key: 'phone'    as const, placeholder: '+49 89 000000' },
                  { label: 'E-Mail',        key: 'email'    as const, placeholder: 'info@epilisse.de' },
                  { label: 'WhatsApp',      key: 'whatsapp' as const, placeholder: '+49 89 000000' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="font-label-caps text-[10px] text-outline uppercase block mb-2">{label}</label>
                    <input
                      className="w-full border-b border-outline-variant bg-transparent py-2 font-body-md text-on-surface focus:border-primary focus:outline-none transition-all"
                      type="text"
                      placeholder={placeholder}
                      value={settings[key] as string}
                      onChange={e => updateSetting(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Öffnungszeiten ────────────────────────────── */}
          {active === 'Öffnungszeiten' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Öffnungszeiten</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Werden auf der Website im Kontakt-Bereich angezeigt.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant divide-y divide-outline-variant/30">
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

          {/* ── Online-Buchung ────────────────────────────── */}
          {active === 'Online-Buchung' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Online-Buchung</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Google Calendar &amp; WhatsApp Integration für die &apos;Termin Buchen&apos;-Buttons auf der Website.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">calendar_month</span>
                      <h4 className="font-headline-sm text-[16px] text-on-surface">Google Calendar</h4>
                    </div>
                    <button
                      onClick={() => updateSetting('bookingActive', !settings.bookingActive)}
                      className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${settings.bookingActive ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.bookingActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-outline uppercase block mb-2">Kalender-URL (Google Calendar Terminbuchungs-Link)</label>
                    <input
                      className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                      type="url"
                      placeholder="https://calendar.google.com/calendar/appointments/..."
                      value={settings.calendarUrl}
                      onChange={e => updateSetting('calendarUrl', e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-outline-variant/30 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">chat</span>
                      <h4 className="font-headline-sm text-[16px] text-on-surface">WhatsApp</h4>
                    </div>
                    <button
                      onClick={() => updateSetting('whatsappActive', !settings.whatsappActive)}
                      className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${settings.whatsappActive ? 'bg-primary' : 'bg-outline-variant'}`}
                    >
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.whatsappActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-outline uppercase block mb-2">WhatsApp-Nummer (internationales Format)</label>
                    <input
                      className="w-full border-b border-outline-variant bg-transparent py-2 font-body-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                      type="text"
                      placeholder="+49 89 000000"
                      value={settings.whatsapp}
                      onChange={e => updateSetting('whatsapp', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-[10px] text-outline uppercase block mb-2">Standard-Nachricht</label>
                    <textarea
                      className="w-full border border-outline-variant bg-transparent p-3 font-body-sm text-on-surface focus:border-primary focus:outline-none resize-none transition-all"
                      rows={2}
                      value={settings.whatsappMsg}
                      onChange={e => updateSetting('whatsappMsg', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Social Media ──────────────────────────────── */}
          {active === 'Social Media' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Social Media</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Links und Handles für Ihre Social-Media-Kanäle.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                {[
                  { label: 'Instagram Handle', key: 'instagram' as const, icon: 'photo_camera', placeholder: '@epilisse_munich' },
                  { label: 'Facebook Seite',   key: 'facebook'  as const, icon: 'thumb_up',    placeholder: 'epilisse.munich' },
                  { label: 'TikTok Handle',    key: 'tiktok'    as const, icon: 'music_video',  placeholder: '@epilisse' },
                  { label: 'Google My Business', key: 'google'  as const, icon: 'location_on',  placeholder: 'https://g.page/epilisse-munich' },
                ].map(({ label, key, icon, placeholder }) => (
                  <div key={key}>
                    <label className="font-label-caps text-[10px] text-outline uppercase block mb-2">{label}</label>
                    <div className="flex items-center gap-3 border-b border-outline-variant pb-2 focus-within:border-primary transition-all">
                      <span className="material-symbols-outlined text-[18px] text-outline">{icon}</span>
                      <input
                        className="flex-1 bg-transparent font-body-md text-on-surface focus:outline-none"
                        type="text"
                        placeholder={placeholder}
                        value={settings[key]}
                        onChange={e => updateSetting(key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Startseite Bilder ─────────────────────────── */}
          {active === 'Startseite Bilder' && (
            <section className="max-w-3xl space-y-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Startseite Bilder</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Bilder für Hero-Slider, Promo-Banner und Über-Uns-Bereich. Leer lassen = Standard-Bild wird verwendet.</p>
              </div>

              {/* Hero Slider Images */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 space-y-5">
                <h4 className="font-headline-sm text-[15px] text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_stories</span>
                  Hero-Slider Bilder (4 Slides)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {([0, 1, 2, 3] as const).map((i) => (
                    <div key={i} className="space-y-2">
                      <label className="font-label-caps text-[10px] text-outline uppercase block">Slide {i + 1}</label>
                      <ImageUpload
                        value={settings.heroImages[i]}
                        onChange={v => {
                          const next = [...settings.heroImages] as [string,string,string,string];
                          next[i] = v;
                          updateSetting('heroImages', next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Promo Image */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 space-y-5">
                <h4 className="font-headline-sm text-[15px] text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">campaign</span>
                  Promo-Banner Bild
                </h4>
                <ImageUpload
                  value={settings.promoImage}
                  onChange={v => updateSetting('promoImage', v)}
                />
              </div>

              {/* About Image */}
              <div className="bg-surface-container-lowest border border-outline-variant p-6 space-y-5">
                <h4 className="font-headline-sm text-[15px] text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                  Über-Uns Bild
                </h4>
                <ImageUpload
                  value={settings.aboutImage}
                  onChange={v => updateSetting('aboutImage', v)}
                />
              </div>
            </section>
          )}

          {/* ── Darstellung ───────────────────────────────── */}
          {active === 'Darstellung' && (
            <section className="max-w-2xl space-y-8">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Darstellung</h3>
                <p className="font-body-sm text-on-surface-variant opacity-70">Sprachen und sichtbare Bereiche auf der Website.</p>
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant p-8 space-y-6">
                <div>
                  <label className="font-label-caps text-[10px] text-outline uppercase block mb-4">Aktive Sprachen</label>
                  <div className="space-y-3">
                    {[
                      { code: 'DE', name: 'Deutsch (Standard)', locked: true },
                      { code: 'EN', name: 'English', locked: false },
                    ].map((lang) => (
                      <div key={lang.code} className="flex items-center justify-between py-3 border-b border-outline-variant/30">
                        <div className="flex items-center gap-3">
                          <span className="font-label-caps text-[11px] bg-surface-container-high px-2 py-0.5 text-on-surface">{lang.code}</span>
                          <span className="font-body-md text-on-surface">{lang.name}</span>
                          {lang.locked && (
                            <span className="font-label-caps text-[9px] bg-primary/10 text-primary px-1.5 py-0.5">Standard</span>
                          )}
                        </div>
                        <button
                          disabled={lang.locked}
                          className={`relative w-10 h-5 rounded-full transition-colors ${lang.locked ? 'bg-primary cursor-not-allowed' : 'bg-primary cursor-pointer'}`}
                        >
                          <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full translate-x-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
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
