"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useBookingModal } from "@/context/BookingModalContext";
import { PREVIEW_GRADIENT } from "@/app/[locale]/admin/behandlungen/data";

// ── Types ─────────────────────────────────────────────────────────────────
export interface PricingItem {
  name: string;
  duration: string;
  price: string;
}

export interface Campaign {
  label: string;
  title: string;
  body: string;
  cta: string;
  icon: string;
  image: string;
  imagePosition?: "top" | "center" | "bottom";
  price?: string;
  oldPrice?: string;
}

export interface ServicePageData {
  label: string;
  h1: string;
  heroDesc: string;
  heroImage: string;
  infoTitle: string;
  infoParagraphs: string[];
  benefitsTitle: string;
  benefits: string[];
  pricingLabel: string;
  pricingTitle: string;
  pricingItems: PricingItem[];
  campaigns: Campaign[];
}

interface Props extends ServicePageData {
  locale: string;
  categoryId: string;
  /** The category tile photo (admin's Kategorie-Bild) — used as a 2nd, distinct fallback image so two banners without their own photo don't show the same picture twice. */
  categoryImage?: string;
}

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

// ── Component ─────────────────────────────────────────────────────────────
export default function ServicePageTemplate({ locale, categoryId, categoryImage, ...data }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const booking = useBookingModal();

  const bookingCta = lc.navCta || "Termin Buchen";
  const fallbackBg = PREVIEW_GRADIENT[categoryId] ?? "linear-gradient(135deg,#f6f3f2,#e5e2dc)";

  // Only the first 2 campaigns get the full-width photo banner treatment; anything beyond
  // that is shown as a smaller, image-free "Weitere Angebote" card further down the page.
  const bigBanners = data.campaigns.slice(0, 2);
  const moreOffers = data.campaigns.slice(2);

  // Pool of every real photo already available anywhere for this category (hero image,
  // category tile, any campaign's own uploaded photo) — a bannerless campaign borrows from
  // this pool (cycling if it has to reuse one) so it never shows an empty-looking banner.
  const imagePool = [data.heroImage, categoryImage, ...data.campaigns.map((c) => c.image)].filter(
    (img): img is string => !!img
  );
  let fallbackIdx = 0;
  const resolvedBanners = bigBanners.map((c) => {
    let image = c.image;
    let position: "top" | "center" | "bottom" = c.imagePosition ?? "top";
    if (!image && imagePool.length > 0) {
      image = imagePool[fallbackIdx % imagePool.length];
      position = "top";
      fallbackIdx++;
    }
    return { ...c, resolvedImage: image, resolvedPosition: position };
  });

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
                className="font-label-caps text-label-caps font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300"
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
                  href="/"
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
            onClick={() => booking.open(categoryId)}
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
          >
            {bookingCta}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-primary"
            aria-label="Menü"
          >
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
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

      <main className="mt-[73px]">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative w-full h-[620px] md:h-[716px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.heroImage}
              alt={data.h1}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="relative z-10 h-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col justify-end pb-20 md:pb-24">
            <div className="max-w-2xl text-white">
              <span className="font-label-caps text-label-caps tracking-[0.3em] uppercase mb-4 block text-white/80">
                {data.label}
              </span>
              <h1 className="font-display-lg text-display-lg mb-6 leading-none">{data.h1}</h1>
              <p className="font-body-lg text-body-lg text-white/90 leading-relaxed max-w-xl">
                {data.heroDesc}
              </p>
            </div>
          </div>
        </section>

        {/* ── INFO & BENEFITS ──────────────────────────────────────────── */}
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-7 flex flex-col justify-center">
              <h2 className="font-headline-lg text-headline-lg text-primary mb-8">{data.infoTitle}</h2>
              <div className="space-y-6 font-body-md text-body-md text-secondary leading-loose">
                {data.infoParagraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            <div className="md:col-span-5 bg-surface-container-low p-10 flex flex-col justify-center border-l-2 border-primary">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">{data.benefitsTitle}</h3>
              <ul className="space-y-4">
                {data.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                    <span className="font-body-md text-on-surface-variant">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────── */}
        <section className="bg-surface-container-lowest py-section-gap">
          <div className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="text-center mb-16">
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
                {data.pricingLabel}
              </span>
              <h2 className="font-headline-lg text-headline-lg mt-2">{data.pricingTitle}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-0">
              {data.pricingItems.map((item, i) => (
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

            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={() => booking.open(categoryId)}
                className="inline-block bg-primary text-on-primary px-10 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
              >
                {bookingCta}
              </button>
            </div>
          </div>
        </section>

        {/* ── CAMPAIGN BANNERS ─────────────────────────────────────────── */}
        {resolvedBanners.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop my-section-gap space-y-8">
            {resolvedBanners.map((banner, i) => {
              const imageLeft = i % 2 === 1; // alternate sides: 1st image-right, 2nd image-left, ...
              const dark = i % 2 === 0;
              const imageBlock = (
                <div
                  key={`img-${i}`}
                  className="h-[380px] md:h-auto bg-cover"
                  style={
                    banner.resolvedImage
                      ? { backgroundImage: `url('${banner.resolvedImage}')`, backgroundPosition: banner.resolvedPosition }
                      : { background: fallbackBg }
                  }
                />
              );
              const textBlock = (
                <div
                  key={`text-${i}`}
                  className={`p-12 md:p-20 flex flex-col justify-center relative overflow-hidden ${
                    dark ? "bg-primary-container text-on-primary-container" : "bg-surface-container-low text-on-surface"
                  }`}
                >
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <span className="material-symbols-outlined text-[180px]">{banner.icon}</span>
                  </div>
                  <span className={`font-label-caps text-label-caps tracking-[0.4em] mb-4 ${dark ? "" : "text-primary"}`}>
                    {banner.label}
                  </span>
                  <h2 className={`font-headline-lg text-display-lg mb-6 leading-tight ${dark ? "text-on-primary-container" : ""}`}>
                    {banner.title}
                  </h2>
                  <p className={`font-body-lg text-body-lg mb-8 ${dark ? "opacity-90" : "text-secondary"}`}>{banner.body}</p>
                  {banner.price && (
                    <div className="mb-8">
                      <span className={`font-label-caps text-label-caps tracking-widest block mb-1.5 ${dark ? "opacity-80" : "text-primary"}`}>
                        AKTIONSPREIS
                      </span>
                      <div className="flex items-baseline gap-3">
                        <span className={`font-headline-lg text-headline-lg ${dark ? "text-on-primary-container" : "text-primary"}`}>
                          {banner.price}
                        </span>
                        {banner.oldPrice && (
                          <span className={`font-body-md line-through ${dark ? "opacity-60" : "text-outline"}`}>
                            {banner.oldPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      onClick={() => booking.open(categoryId)}
                      className={`inline-block px-10 py-4 font-label-caps text-label-caps tracking-widest transition-all ${
                        dark
                          ? "bg-on-primary-container text-primary-container hover:opacity-90"
                          : "bg-primary text-on-primary hover:bg-primary-container"
                      }`}
                    >
                      {banner.cta}
                    </button>
                  </div>
                </div>
              );
              return (
                <div key={i} className="relative overflow-hidden lux-shadow border border-outline-variant/30">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {imageLeft ? (
                      <>
                        <div className="order-last md:order-first">{imageBlock}</div>
                        {textBlock}
                      </>
                    ) : (
                      <>
                        {textBlock}
                        {imageBlock}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* ── WEITERE ANGEBOTE (campaigns beyond the first 2, image-free) ──── */}
        {moreOffers.length > 0 && (
          <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop my-section-gap">
            <h3 className="font-headline-sm text-headline-sm text-primary text-center mb-10">Weitere Angebote</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {moreOffers.map((offer, i) => (
                <div
                  key={i}
                  className="bg-surface-container-low border border-outline-variant/40 p-8 flex flex-col items-start lux-shadow hover:border-primary/50 transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-[32px] mb-4">{offer.icon}</span>
                  <span className="font-label-caps text-label-caps tracking-[0.3em] text-primary mb-2">{offer.label}</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-3">{offer.title}</h4>
                  <p className="font-body-sm text-secondary mb-6 flex-1">{offer.body}</p>
                  {offer.price && (
                    <div className="flex items-baseline gap-2 mb-5">
                      <span className="font-headline-sm text-headline-sm text-primary">{offer.price}</span>
                      {offer.oldPrice && (
                        <span className="font-body-sm text-outline line-through">{offer.oldPrice}</span>
                      )}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => booking.open(categoryId)}
                    className="w-full bg-primary text-on-primary py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
                  >
                    {offer.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-highest w-full px-margin-mobile md:px-margin-desktop py-section-gap grid grid-cols-1 md:grid-cols-4 gap-gutter border-t border-outline-variant">
        <div>
          <Link href="/" className="font-display-lg text-[26px] text-primary tracking-wide font-bold mb-6 block">
            EPILISSE
          </Link>
          <p className="font-body-sm text-secondary leading-relaxed">
            {lc.footerTagline}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Behandlungen</h4>
          {[
            { href: "/laser-haarentfernung", label: "Laser-Haarentfernung" },
            { href: "/gesichtsaesthetik", label: "Gesichtsästhetik" },
            { href: "/body-contouring", label: "Body Contouring" },
            { href: "/injectables", label: "Injectables" },
            { href: "/manikure-pedikure", label: "Manikür & Pedikür" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-body-sm text-secondary hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Rechtliches</h4>
          {["Impressum", "Datenschutz", "AGB", "Widerruf"].map((item) => (
            <a key={item} href="#" className="font-body-sm text-secondary hover:text-primary transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Kontakt</h4>
          <span className="font-body-sm text-secondary">{settings.address}</span>
          <span className="font-body-sm text-secondary">{settings.phone}</span>
          <span className="font-body-sm text-secondary">{settings.email}</span>
        </div>
      </footer>
    </div>
  );
}
