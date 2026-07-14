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
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA3IvtG-coL1R-rxRRkCnvRhXTeCycUg1nJq-MJ9OwNUG_hyq5EKihhgBnZ6-I8FAXVro5Kaa5XCJjLSIsa6Xb7xroT8mf9NdJM89YISQMXd0yIQ_HlT9Ex29xuoiRwoTc0hr0Yn3r8_n9K0e5RlFX-CeRmNZdVeFcpCDBQ0OB8n0Y6aBnvXrJX1wH1cWYO97zGEQPOmnnZE13-I2ZEY81xSze4Uv-GEDoHwfTQnB2_t-NNQGEPkoA5XgHE4w9KWM4CAJG-EdG8Cy_z",
  gesicht:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDrgLWhl7EjgUAhqHCfTK1D52PmXPF9J-BJYYc_ojdoV_gy4UGXEjkgANF3wWYjHqy53LTIplM-oEpi7cxFjRPMtQ1bDsidV5LBX3bL8Sfb-RDP7uopJFXAFj30wN3qxWCSR6iuYoaAF86bhNElVdByUZ2wKcEt_5GPybU5jCI8h0_dZa6oLHxRSXbODo0jVVObxQw5TcoKOL-Xy3V_7f0RZxvB2a9aoXyvX-0QNPChRJ8wJT_7b5ipFi3L6aybwqTrlQZMuPLtmWRQ",
  body: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS7VEqn3YLIpzxeNRbM1gcyi8MJr1qDdhCbgVl3FgIek9EyqNPv0_RSpzK4D8Fj_sjWdLM3pAfQAOR3aelWP54bwPTkASLYexbRvDWiWqoOKudhs8auDngKhBI3OapBF6Q5nwLH0MoCdYY77ZDOyrZ4Utsa0vpTToujP6rCNRlUYOJkmc6h4lIkPVLpiYi_z5U9a40yt2bqbxzsI4U_adkDSi5HdYRzHkCtDQUSdtlUs2B7TFDMBv6Br8-tRgx1sCaravafH3RZyOU",
  inject:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2R1r5IBHzprIEBLdeHT1f02OFMOX85Ol0fXFMTE8Mn9Nlc1lMes1BoOgj1lwKVSGR-dIFS-r-gyxMLZZESLXUcH_zS9UBq5T3z81zaxMXyfkXaTN50ZQOxmiM9kMWb4FbuKoODmgwAvE3ta_i60Ekgbw0pVcC1SjtZtC__ZxTNJSwkcNaB_h8XguwNKKEQmQHrBovNuCFUoWvqMpN2bzbrTH7ZN2a66uUpCi_65MRDuC8j05691WrlUa-ULD7rQ27qkKsnnnR_7Q7",
  mani: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtJndxncsaGViuLmDZDBacgojv8siWTA93LPFPxNKQpEt2zcmQOehCknTGGJyu6i6UnkaiofOhED7An8f2QpALTSIozuiak5h3D6E_eJGWt9ZvHmvNcykq9-o53KhIoV6PlcBlXDxkJoMv-p60rCfkvezFpByYXAE-Nf2Yqu6Ce3WZ-puxUEYanR11hTB_J-X_htoKYgGVsUvScVZLae2VUaXdaKyQuFNuH1TxcUFPuaVWjKQRAg8BbvmnFqGiwILaxXwCVD4uJQFs",
};

export default function BehandlungenPage() {
  const params = useParams();
  const locale = (params?.locale as "de" | "en" | "tr") || "de";
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
            EPILISSE
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
