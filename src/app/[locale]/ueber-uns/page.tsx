'use client';
import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminAboutValues } from "@/hooks/useAdminAboutValues";
import { useAdminReviews } from "@/hooks/useAdminReviews";
import { useBookingModal } from "@/context/BookingModalContext";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

const FALLBACK_ABOUT_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDCTVBkANRMCY5r7E2JLvTph0kXEA4T7GxktWv_bKMsgdG-AzO4MqdgFWvxeMIo4R4mlT3yzjHXFTmz2RMdSYBujyVKX-cIPUOMYrFBB2ecuVjcgYnes1xN_ami77RkyJfoZ850mfG5EwXU8-B_9qIIv66-_hQmWFSIruc6mQD8FuAZoQ9poHrEZJ1OhiQ92g2-Wr5bKJd6ZeyHf3zmq1k6SioVRtxAlftGRh3_AXEo5W9nWYw4m18vMFt9BX55pIVBkjVLW8zw2To";

export default function UeberUnsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as "de" | "en" | "tr") || "de";
  const [menuOpen, setMenuOpen] = useState(false);

  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const aboutValues = useAdminAboutValues();
  const reviews = useAdminReviews();
  const booking = useBookingModal();

  const bookingCta = lc.navCta || "Termin Buchen";
  const aboutImg = settings.aboutImage || FALLBACK_ABOUT_IMAGE;

  const NAV_LINKS = [
    { href: "/behandlungen", label: lc.navBehandlungen || "Behandlungen" },
    { href: "/preise", label: lc.navPreise || "Preise" },
    { href: "/ueber-uns", label: lc.navUeberUns || "Über Uns" },
    { href: "/#kontakt", label: lc.navKontakt || "Kontakt" },
  ];

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
                  item.href === "/ueber-uns" ? "text-primary" : "text-on-surface-variant hover:text-primary"
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
                  href="/ueber-uns"
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

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section className="pt-40 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
              {lc.aboutSectionLabel || t("about.sectionLabel")}
            </span>
            <h1 className="font-display-lg text-headline-lg font-semibold text-on-surface mb-6 leading-tight">
              {lc.aboutTitle || t("about.title")}
            </h1>
            <p className="font-body-lg text-body-lg text-secondary mb-10">
              {lc.aboutDesc || t("about.desc")}
            </p>

            {/* Values */}
            <div className="flex flex-col gap-8">
              {aboutValues.map((v) => (
                <div key={v.id} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">{v.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface mb-1">
                      {v.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/behandlungen"
              className="inline-flex items-center gap-1 mt-10 font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors"
            >
              {t("services.discover")}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* Right: image */}
          <div className="relative overflow-hidden rounded-xl aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={aboutImg}
              alt="EPILISSE Studio München"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-label-caps text-label-caps text-white/80 tracking-widest">
                MÜNCHEN · LUXURY BEAUTY CARE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEWERTUNGEN — Real Treatwell reviews ────────────────────────── */}
      <section className="pb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
            {t("reviews.sectionLabel")}
          </span>
          <h2 className="font-display-lg text-display-lg font-bold text-primary mb-4">
            {t("reviews.title")}
          </h2>
          <p className="font-body-md text-body-md text-secondary max-w-lg mx-auto">
            {t("reviews.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter items-stretch">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="group relative bg-surface border border-outline-variant/20 p-8 pt-10 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full"
            >
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 w-10 h-[3px] bg-primary" />

              {/* Decorative quote mark */}
              <span className="absolute top-1 right-4 font-display-lg text-[64px] leading-none text-primary/10 select-none pointer-events-none">
                &rdquo;
              </span>

              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <span key={s} className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                ))}
              </div>

              <p className="font-display-lg text-[17px] leading-snug text-on-surface relative z-10 line-clamp-5">
                {r.text}
              </p>

              <div className="flex items-center justify-between gap-2 pt-4 mt-auto border-t border-outline-variant/20">
                <span className="font-label-caps text-label-caps text-primary font-semibold tracking-wide">
                  {r.name}
                </span>
                <span className="font-label-caps text-[10px] text-secondary/70 border border-outline-variant/40 rounded-full px-2 py-0.5">
                  {r.treatment}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href={settings.treatwellUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all lux-shadow"
          >
            <span className="material-symbols-outlined text-lg">star</span>
            {t("reviews.cta")}
          </a>
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
