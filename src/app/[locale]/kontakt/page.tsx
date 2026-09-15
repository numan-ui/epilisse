'use client';
import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useBookingModal } from "@/context/BookingModalContext";
import FloatingNav from "@/components/LazyFloatingNav";
import SiteFooter from "@/components/SiteFooter";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

export default function KontaktPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as "de" | "en") || "de";
  const [menuOpen, setMenuOpen] = useState(false);

  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const booking = useBookingModal();

  const bookingCta = lc.navCta || "Termin Buchen";

  const NAV_LINKS = [
    { href: "/behandlungen", label: lc.navBehandlungen || "Behandlungen" },
    { href: "/preise", label: lc.navPreise || "Preise" },
    { href: "/aktionen", label: lc.navAktionen || "Aktionen" },
    { href: "/ueber-uns", label: lc.navUeberUns || "Über Uns" },
    { href: "/kontakt", label: lc.navKontakt || "Kontakt" },
  ];

  const waRaw = settings.whatsapp.replace(/[\s+\-()]/g, '');
  const WA_URL = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(settings.whatsappMsg)}`
    : 'https://wa.me/4989XXXXXXXX';
  const MAPS_URL = settings.address
    ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
    : 'https://maps.google.com/?q=München';

  const displayAddress = settings.address || t("contact.address");
  const displayHours = settings.hours
    .map(d => `${d.day}: ${d.closed ? 'Geschlossen' : `${d.open} – ${d.close} Uhr`}`)
    .join('\n');
  const displayPhone = settings.phone || t("contact.phone");
  const phoneHref = displayPhone.replace(/\s/g, '');

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 glass-nav bg-surface/95 border-b border-outline-variant/30 lux-shadow">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display-lg text-[26px] tracking-wide epilisse-logo">
            {settings.name}
          </Link>
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-label-caps text-label-caps font-semibold transition-colors duration-300 ${
                  item.href === "/kontakt" ? "text-primary" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1 font-label-caps text-label-caps text-secondary">
            {LOCALES.map((loc, i) => (
              <span key={loc.code} className="flex items-center">
                <Link
                  href="/kontakt"
                  locale={loc.code}
                  className={`px-1 transition-colors duration-200 ${
                    locale === loc.code ? "text-primary font-semibold" : "hover:text-primary"
                  }`}
                >
                  {loc.label}
                </Link>
                {i < LOCALES.length - 1 && <span className="text-outline/50">|</span>}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => booking.open()}
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all scale-100 hover:scale-105 duration-200 rounded-[var(--radius-cta)]"
          >
            {bookingCta}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-primary"
            aria-label="Menü öffnen"
          >
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-surface flex flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* ── KONTAKT ──────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em]">
              {lc.contactSectionLabel || t("contact.sectionLabel")}
            </span>
            <span className="w-16 h-[2px] bg-primary" />
          </div>
          <h1 className="font-display-lg text-headline-lg font-semibold text-on-surface text-center">
            {lc.contactTitle || t("contact.title")}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Address card */}
          <div className="bento-card bg-surface-container-low border border-outline-variant/60 p-8 flex flex-col gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
              {lc.contactAddressTitle || t("contact.addressTitle")}
            </h3>
            <address className="font-body-sm text-body-sm text-on-surface-variant not-italic whitespace-pre-line">
              {displayAddress}
            </address>
          </div>

          {/* Hours card */}
          <div className="bento-card bg-surface-container-low border border-outline-variant/60 p-8 flex flex-col gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
              {lc.contactHoursTitle || t("contact.hoursTitle")}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
              {displayHours}
            </p>
          </div>

          {/* Phone card */}
          <div className="bento-card bg-surface-container-low border border-outline-variant/60 p-8 flex flex-col gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">phone</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
              {lc.contactPhoneTitle || t("contact.phoneTitle")}
            </h3>
            <a
              href={`tel:${phoneHref}`}
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              {displayPhone}
            </a>
          </div>
        </div>

        {/* CTA buttons row */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
          <button
            type="button"
            onClick={() => booking.open()}
            className="bg-cta text-on-cta px-10 py-5 font-label-caps text-label-caps tracking-widest hover:bg-cta-hover transition-all text-center lux-shadow rounded-[var(--radius-cta)]"
          >
            {t("contact.ctaCalendar")}
          </button>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-primary text-primary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:bg-primary/5 transition-all rounded-[var(--radius-cta)]"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            {t("contact.ctaWhatsapp")}
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-outline-variant text-secondary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:border-primary hover:text-primary transition-all rounded-[var(--radius-cta)]"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            {t("contact.ctaMaps")}
          </a>
        </div>
      </section>

      <FloatingNav />
      <SiteFooter />
    </div>
  );
}
