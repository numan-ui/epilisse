'use client';
import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminServices } from "@/hooks/useAdminServices";
import { useBookingModal } from "@/context/BookingModalContext";
import { FRONTEND_SLUG } from "@/app/[locale]/admin/behandlungen/data";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

const FALLBACK_PRICING: Record<string, { name: string; duration: string; price: string }[]> = {
  laser: [
    { name: "Oberlippe oder Kinn", duration: "15 Min.", price: "€ 39,00" },
    { name: "Achselhöhlen", duration: "20 Min.", price: "€ 55,00" },
    { name: "Unterarme", duration: "30 Min.", price: "€ 89,00" },
    { name: "Beine komplett", duration: "60 Min.", price: "€ 189,00" },
    { name: "Rücken (komplett)", duration: "45 Min.", price: "€ 149,00" },
    { name: "Ganzkörper Luxury Pack", duration: "120 Min.", price: "€ 349,00" },
  ],
  gesicht: [
    { name: "Basis-Gesichtsbehandlung", duration: "60 Min.", price: "€ 89,00" },
    { name: "HydraFacial Classic", duration: "60 Min.", price: "€ 149,00" },
    { name: "HydraFacial Deluxe", duration: "90 Min.", price: "€ 199,00" },
    { name: "Chemical Peeling (leicht bis mittel)", duration: "45 Min.", price: "€ 119,00" },
    { name: "Microneedling (Gesicht)", duration: "60 Min.", price: "€ 189,00" },
    { name: "Premium Glow Signature", duration: "90 Min.", price: "€ 299,00" },
  ],
  body: [
    { name: "Kryolipolyse (1 Zone)", duration: "60 Min.", price: "€ 199,00" },
    { name: "Kryolipolyse (2 Zonen)", duration: "90 Min.", price: "€ 349,00" },
    { name: "RF-Lifting (Gesicht & Hals)", duration: "45 Min.", price: "€ 149,00" },
    { name: "Ultraschall-Kavitation", duration: "45 Min.", price: "€ 129,00" },
    { name: "Vakuumtherapie Beine", duration: "60 Min.", price: "€ 119,00" },
    { name: "Body Sculpting Premium Paket", duration: "150 Min.", price: "€ 599,00" },
  ],
  inject: [
    { name: "Botulinum Toxin (1 Zone)", duration: "30 Min.", price: "€ 199,00" },
    { name: "Botulinum Toxin (3 Zonen)", duration: "30 Min.", price: "€ 349,00" },
    { name: "Hyaluronsäure Lippen", duration: "45 Min.", price: "€ 299,00" },
    { name: "Hyaluronsäure Wangen & Kinn", duration: "45 Min.", price: "€ 399,00" },
    { name: "Profhilo (2 Sitzungen)", duration: "je 30 Min.", price: "€ 699,00" },
    { name: "Anti-Aging Full-Face Konzept", duration: "60 Min.", price: "€ 899,00" },
  ],
  mani: [
    { name: "Klassische Maniküre", duration: "45 Min.", price: "€ 45,00" },
    { name: "EPILISSE Signature Shellac", duration: "75 Min.", price: "€ 65,00" },
    { name: "Luxus Spa Maniküre", duration: "90 Min.", price: "€ 85,00" },
    { name: "French Design / Nail Art", duration: "je nach Design", price: "ab € 15,00" },
    { name: "Medizinische Fußpflege", duration: "50 Min.", price: "€ 55,00" },
    { name: "Pediküre mit Shellac", duration: "75 Min.", price: "€ 75,00" },
    { name: "Royal Pediküre Spa", duration: "90 Min.", price: "€ 95,00" },
  ],
};

export default function PreisePage() {
  const params = useParams();
  const locale = (params?.locale as "de" | "en" | "tr") || "de";
  const [menuOpen, setMenuOpen] = useState(false);

  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const categories = useAdminCategories();
  const booking = useBookingModal();

  const bookingCta = lc.navCta || "Termin Buchen";

  const NAV_LINKS = [
    { href: "/#behandlungen", label: lc.navBehandlungen || "Behandlungen" },
    { href: "/preise", label: lc.navPreise || "Preise" },
    { href: "/ueber-uns", label: lc.navUeberUns || "Über Uns" },
    { href: "/#kontakt", label: lc.navKontakt || "Kontakt" },
  ];

  // Rules of hooks: fixed set of categories, called unconditionally.
  const laser   = useAdminServices("laser", FALLBACK_PRICING.laser);
  const gesicht = useAdminServices("gesicht", FALLBACK_PRICING.gesicht);
  const body    = useAdminServices("body", FALLBACK_PRICING.body);
  const inject  = useAdminServices("inject", FALLBACK_PRICING.inject);
  const mani    = useAdminServices("mani", FALLBACK_PRICING.mani);

  const pricingByCat: Record<string, { name: string; duration: string; price: string }[]> = {
    laser, gesicht, body, inject, mani,
  };

  const visibleCats = categories.filter(c => c.visible && pricingByCat[c.id]);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 glass-nav bg-surface/95 border-b border-outline-variant/30 lux-shadow">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display-lg text-[26px] tracking-wide font-bold text-primary">
            EPILISSE
          </Link>
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-label-caps text-label-caps font-semibold transition-colors duration-300 ${
                  item.href === "/preise" ? "text-primary" : "text-on-surface-variant hover:text-primary"
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
                  href="/preise"
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
          PREISE & LEISTUNGEN
        </span>
        <h1 className="font-display-lg text-display-lg font-bold text-primary mb-4">
          Transparente Preise für Ihre Schönheit
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto">
          Alle Behandlungen und Preise auf einen Blick — individuelle Beratung inklusive.
        </p>
      </section>

      {/* ── PRICE TABLES ─────────────────────────────────────────────────── */}
      <section className="pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto space-y-16">
        {visibleCats.map((cat) => (
          <div key={cat.id} id={cat.id} className="scroll-mt-32">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6 border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                </div>
                <div>
                  <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface">{cat.name}</h2>
                  <p className="font-body-sm text-body-sm text-secondary">{cat.desc}</p>
                </div>
              </div>
              <Link
                href={`/${FRONTEND_SLUG[cat.id] ?? cat.id}`}
                className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors flex items-center gap-1 flex-shrink-0"
              >
                Alle Details
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-0">
              {pricingByCat[cat.id].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-6 border-b border-outline-variant hover:bg-surface/50 transition-colors px-4 group cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-body-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                    {item.duration && (
                      <span className="font-body-sm text-secondary">
                        Behandlungsdauer: ca. {item.duration}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 shrink-0 ml-4">
                    <span className="font-display-lg text-headline-md text-primary whitespace-nowrap">
                      {item.price}
                    </span>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">
                      arrow_forward
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center pt-8">
          <button
            type="button"
            onClick={() => booking.open()}
            className="bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all lux-shadow"
          >
            {bookingCta}
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full px-margin-mobile md:px-margin-desktop py-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="font-display-lg text-headline-md tracking-widest text-primary">
            EPILISSE
          </Link>
          <span className="font-body-sm text-body-sm text-secondary">
            {settings.address}
          </span>
        </div>
      </footer>

    </div>
  );
}
