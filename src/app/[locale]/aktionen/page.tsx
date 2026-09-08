'use client';
import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import SmartImage from "@/components/SmartImage";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useBookingModal } from "@/context/BookingModalContext";
import { useAktionen, visibleAktionen } from "@/hooks/useAktionen";
import { countdownLabel, validityText } from "@/lib/aktion";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

export default function AktionenPage() {
  const params = useParams();
  const locale = (params?.locale as "de" | "en") || "de";
  const [menuOpen, setMenuOpen] = useState(false);

  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const categories = useAdminCategories();
  const booking = useBookingModal();
  const list = visibleAktionen(useAktionen());

  const bookingCta = lc.navCta || "Termin Buchen";

  const NAV_LINKS = [
    { href: "/#behandlungen", label: lc.navBehandlungen || "Behandlungen" },
    { href: "/preise", label: lc.navPreise || "Preise" },
    { href: "/aktionen", label: lc.navAktionen || "Aktionen" },
    { href: "/ueber-uns", label: lc.navUeberUns || "Über Uns" },
    { href: "/#kontakt", label: lc.navKontakt || "Kontakt" },
  ];

  const groups = categories
    .map((cat) => ({ cat, items: list.filter((a) => a.category === cat.id) }))
    .filter((g) => g.items.length > 0);

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
                  item.href === "/aktionen" ? "text-primary" : "text-on-surface-variant hover:text-primary"
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
                  href="/aktionen"
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-16 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto text-center">
        <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
          {lc.navAktionen || "AKTIONEN"}
        </span>
        <h1 className="font-display-lg text-display-lg font-bold text-primary mb-4">
          Aktuelle Kombi-Pakete &amp; Angebote
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto">
          Unsere laufenden Aktionen auf einen Blick — solange sie gültig sind.
        </p>
      </section>

      {/* ── AKTIONEN ─────────────────────────────────────────────────────── */}
      <section className="pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto space-y-16">
        {groups.length === 0 && (
          <p className="text-center font-body-md text-secondary">Zurzeit keine aktiven Aktionen.</p>
        )}

        {groups.map(({ cat, items }) => (
          <div key={cat.id}>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">{cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((a) => {
                const badge = countdownLabel(a.endDate);
                const valid = validityText(a.startDate, a.endDate);
                return (
                  <article
                    key={a.id}
                    className="relative flex flex-col border border-outline-variant/40 rounded-[14px] bg-surface-container-lowest overflow-hidden lux-shadow"
                  >
                    {badge && (
                      <span className="absolute top-3 right-3 z-10 font-label-caps text-[10px] text-primary bg-primary/12 border border-primary/25 rounded-full px-2.5 py-1">
                        {badge}
                      </span>
                    )}
                    <div className="aspect-[4/3] bg-secondary-container/40 overflow-hidden">
                      {a.image && (
                        <SmartImage
                          src={a.image}
                          alt={a.title}
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                          className={`brand-photo object-cover w-full h-full ${
                            a.imagePosition === "bottom" ? "object-bottom" : a.imagePosition === "center" ? "object-center" : "object-top"
                          }`}
                          sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-2 p-5 flex-1">
                      <span className="font-label-caps text-[10px] text-primary tracking-[0.18em]">{a.label || "Aktion"}</span>
                      <h3 className="font-headline-sm text-[17px] text-on-surface whitespace-pre-line">{a.title}</h3>
                      {a.desc && <p className="font-body-sm text-body-sm text-secondary">{a.desc}</p>}
                      {valid && <span className="font-body-sm text-[11.5px] text-on-surface-variant opacity-80">{valid}</span>}
                      <div className="flex items-center justify-between gap-3 mt-auto pt-3">
                        {a.price && (
                          <span className="flex items-baseline gap-2">
                            {a.oldPrice && <span className="font-body-sm text-[13px] text-outline line-through">{a.oldPrice}</span>}
                            <span className="font-headline-sm text-[18px] text-primary font-semibold">{a.price}</span>
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => booking.open(a.category)}
                          className="bg-primary text-on-primary px-4 py-2 font-label-caps text-[11px] tracking-widest rounded-[var(--radius-cta)] hover:bg-primary-container transition-all"
                        >
                          {a.cta || "Jetzt buchen"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full px-margin-mobile md:px-margin-desktop pt-12 pb-16">
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
