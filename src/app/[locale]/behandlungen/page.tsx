'use client';
import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useBookingModal } from "@/context/BookingModalContext";
import { FRONTEND_SLUG } from "@/app/[locale]/admin/behandlungen/data";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

/* Fallback images (Stitch AI – replace with real salon photos before launch) */
const IMG: Record<string, string> = {
  laser:
    "/images/laser-hair-removal.png",
  gesicht:
    "/images/gesichtsaesthetik.png",
  body: "/images/body-contouring.png",
  inject:
    "/images/injectables.png",
  mani: "/images/manikure-pedikure.png",
};

export default function BehandlungenPage() {
  const params = useParams();
  const locale = (params?.locale as "de" | "en") || "de";
  const [menuOpen, setMenuOpen] = useState(false);

  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const categories = useAdminCategories();
  const booking = useBookingModal();

  const bookingCta = lc.navCta || "Termin Buchen";

  const NAV_LINKS = [
    { href: "/behandlungen", label: lc.navBehandlungen || "Behandlungen" },
    { href: "/preise", label: lc.navPreise || "Preise" },
    { href: "/ueber-uns", label: lc.navUeberUns || "Über Uns" },
    { href: "/#kontakt", label: lc.navKontakt || "Kontakt" },
  ];

  const visibleCats = categories.filter(c => c.visible);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 glass-nav bg-surface/95 border-b border-outline-variant/30 lux-shadow">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display-lg text-[26px] tracking-wide font-bold text-primary">
            {settings.name}
          </Link>
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-label-caps text-label-caps font-semibold transition-colors duration-300 ${
                  item.href === "/behandlungen" ? "text-primary" : "text-on-surface-variant hover:text-primary"
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
                  href="/behandlungen"
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
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all scale-95 hover:scale-100 duration-200"
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-16 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto text-center">
        <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
          UNSERE BEHANDLUNGEN
        </span>
        <h1 className="font-display-lg text-display-lg font-bold text-primary mb-4">
          Behandlungen im Überblick
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto">
          Entdecken Sie unser gesamtes Leistungsspektrum — für jede Behandlung finden Sie Details auf der jeweiligen Seite.
        </p>
      </section>

      {/* ── CATEGORY CARDS ───────────────────────────────────────────────── */}
      <section className="pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {visibleCats.map((cat) => (
            <Link
              key={cat.id}
              href={`/${FRONTEND_SLUG[cat.id] ?? cat.id}`}
              className="bento-card group flex flex-col md:flex-row gap-6 bg-surface-container-lowest border border-outline-variant/30 overflow-hidden cursor-pointer"
            >
              <div className="w-full md:w-[220px] h-[200px] md:h-auto flex-shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image || IMG[cat.id] || IMG.laser}
                  alt={cat.name}
                  className="brand-photo w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:pr-8 md:pl-0">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                </div>
                <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">
                  {cat.name}
                </h2>
                <p className="font-body-sm text-body-sm text-secondary mb-4">
                  {cat.desc}
                </p>
                <span className="font-label-caps text-label-caps text-primary group-hover:text-primary-container transition-colors flex items-center gap-1">
                  Mehr erfahren
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full px-margin-mobile md:px-margin-desktop py-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-display-lg text-headline-md tracking-widest text-primary">
            {settings.name}
          </Link>
          <span className="font-body-sm text-body-sm text-secondary">
            {settings.address}
          </span>
        </div>
      </footer>

    </div>
  );
}
