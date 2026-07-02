"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { FRONTEND_SLUG } from "@/app/[locale]/admin/behandlungen/data";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminHeroSlides } from "@/hooks/useAdminHeroSlides";
import { useAdminPromoBanners } from "@/hooks/useAdminPromoBanners";
import { useAdminAboutValues } from "@/hooks/useAdminAboutValues";

/* ── Image constants (Stitch AI – replace with real salon photos) ── */
const IMG = {
  laser:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA3IvtG-coL1R-rxRRkCnvRhXTeCycUg1nJq-MJ9OwNUG_hyq5EKihhgBnZ6-I8FAXVro5Kaa5XCJjLSIsa6Xb7xroT8mf9NdJM89YISQMXd0yIQ_HlT9Ex29xuoiRwoTc0hr0Yn3r8_n9K0e5RlFX-CeRmNZdVeFcpCDBQ0OB8n0Y6aBnvXrJX1wH1cWYO97zGEQPOmnnZE13-I2ZEY81xSze4Uv-GEDoHwfTQnB2_t-NNQGEPkoA5XgHE4w9KWM4CAJG-EdG8Cy_z",
  facial:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDrgLWhl7EjgUAhqHCfTK1D52PmXPF9J-BJYYc_ojdoV_gy4UGXEjkgANF3wWYjHqy53LTIplM-oEpi7cxFjRPMtQ1bDsidV5LBX3bL8Sfb-RDP7uopJFXAFj30wN3qxWCSR6iuYoaAF86bhNElVdByUZ2wKcEt_5GPybU5jCI8h0_dZa6oLHxRSXbODo0jVVObxQw5TcoKOL-Xy3V_7f0RZxvB2a9aoXyvX-0QNPChRJ8wJT_7b5ipFi3L6aybwqTrlQZMuPLtmWRQ",
  body: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS7VEqn3YLIpzxeNRbM1gcyi8MJr1qDdhCbgVl3FgIek9EyqNPv0_RSpzK4D8Fj_sjWdLM3pAfQAOR3aelWP54bwPTkASLYexbRvDWiWqoOKudhs8auDngKhBI3OapBF6Q5nwLH0MoCdYY77ZDOyrZ4Utsa0vpTToujP6rCNRlUYOJkmc6h4lIkPVLpiYi_z5U9a40yt2bqbxzsI4U_adkDSi5HdYRzHkCtDQUSdtlUs2B7TFDMBv6Br8-tRgx1sCaravafH3RZyOU",
  injectables:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB2R1r5IBHzprIEBLdeHT1f02OFMOX85Ol0fXFMTE8Mn9Nlc1lMes1BoOgj1lwKVSGR-dIFS-r-gyxMLZZESLXUcH_zS9UBq5T3z81zaxMXyfkXaTN50ZQOxmiM9kMWb4FbuKoODmgwAvE3ta_i60Ekgbw0pVcC1SjtZtC__ZxTNJSwkcNaB_h8XguwNKKEQmQHrBovNuCFUoWvqMpN2bzbrTH7ZN2a66uUpCi_65MRDuC8j05691WrlUa-ULD7rQ27qkKsnnnR_7Q7",
  mani: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtJndxncsaGViuLmDZDBacgojv8siWTA93LPFPxNKQpEt2zcmQOehCknTGGJyu6i6UnkaiofOhED7An8f2QpALTSIozuiak5h3D6E_eJGWt9ZvHmvNcykq9-o53KhIoV6PlcBlXDxkJoMv-p60rCfkvezFpByYXAE-Nf2Yqu6Ce3WZ-puxUEYanR11hTB_J-X_htoKYgGVsUvScVZLae2VUaXdaKyQuFNuH1TxcUFPuaVWjKQRAg8BbvmnFqGiwILaxXwCVD4uJQFs",
  about:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCDCTVBkANRMCY5r7E2JLvTph0kXEA4T7GxktWv_bKMsgdG-AzO4MqdgFWvxeMIo4R4mlT3yzjHXFTmz2RMdSYBujyVKX-cIPUOMYrFBB2ecuVjcgYnes1xN_ami77RkyJfoZ850mfG5EwXU8-B_9qIIv66-_hQmWFSIruc6mQD8FuAZoQ9poHrEZJ1OhiQ92g2-Wr5bKJd6ZeyHf3zmq1k6SioVRtxAlftGRh3_AXEo5W9nWYw4m18vMFt9BX55pIVBkjVLW8zw2To",
};

/* ── Hero slide overlays ────────────────────────────────────── */
const OVERLAYS = [
  "bg-black/30",
  "bg-black/40",
  "bg-black/20",
  "bg-black/30",
];

/* ── Original fallback images (replaced by admin settings when set) ── */
const ORIG_IDS = ['laser', 'gesicht', 'andere', 'body', 'inject', 'mani'];

export default function HomePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";

  const settings   = useAdminSettings();
  const categories = useAdminCategories();
  const lc         = useAdminLandingContent();
  const heroSlides = useAdminHeroSlides();
  const promoBanners = useAdminPromoBanners();
  const aboutValues = useAdminAboutValues();

  /* ── Dynamic booking URLs from admin settings ─── */
  const GCAL_URL = settings.calendarUrl || 'https://calendar.google.com';
  const waRaw    = settings.whatsapp.replace(/[\s+\-()]/g, '');
  const WA_URL   = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(settings.whatsappMsg)}`
    : 'https://wa.me/4989XXXXXXXX';
  const MAPS_URL = settings.address
    ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
    : 'https://maps.google.com/?q=München';

  /* ── Contact display values: admin settings override i18n placeholders ─── */
  const displayAddress = settings.address || t("contact.address");
  const displayHours   = settings.hours
    .map(d => `${d.day}: ${d.closed ? 'Geschlossen' : `${d.open} – ${d.close} Uhr`}`)
    .join('\n');
  const displayPhone   = settings.phone || t("contact.phone");
  const phoneHref      = displayPhone.replace(/\s/g, '');

  /* ── Images: admin override or fallback to originals ─── */
  const aboutImg = settings.aboutImage || IMG.about;
  const getCatImage = (id: string) => categories.find(c => c.id === id)?.image || '';

  /* ── Bento grid: visible original cats + custom cats ─── */
  const visibleCats  = categories.filter(c => c.visible);
  const customCats   = visibleCats.filter(c => !ORIG_IDS.includes(c.id));
  const isVisible    = (id: string) => categories.find(c => c.id === id)?.visible !== false;
  const getCatName   = (id: string) => categories.find(c => c.id === id)?.name ?? '';

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setSlideKey((prev) => prev + 1);
  }, [heroSlides.length]);

  useEffect(() => {
    const durationMs = (heroSlides[currentSlide]?.duration || 10) * 1000;
    const timer = setTimeout(nextSlide, durationMs);
    return () => clearTimeout(timer);
  }, [currentSlide, heroSlides, nextSlide]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    setSlideKey((prev) => prev + 1);
  };

  const locales = [
    { code: "de", label: "DE" },
    { code: "en", label: "EN" },
  ];

  return (
    <main className="min-h-screen">

      {/* ══════════════════════════════════════════════════════
          NAV BAR — Fixed glassmorphism
      ══════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 glass-nav bg-surface/95 border-b border-outline-variant/30 lux-shadow">
        {/* Logo */}
        <a href="#" className="font-display-lg text-headline-md tracking-widest epilisse-logo">
          EPILISSE
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#behandlungen" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors duration-300">
            {lc.navBehandlungen || t("nav.behandlungen")}
          </a>
          <a href="#preise" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors duration-300">
            {lc.navPreise || t("nav.preise")}
          </a>
          <a href="#uber-uns" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors duration-300">
            {lc.navUeberUns || t("nav.ueberUns")}
          </a>
          <a href="#kontakt" className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors duration-300">
            {lc.navKontakt || t("nav.kontakt")}
          </a>
        </div>

        {/* Right: lang switcher + CTA */}
        <div className="flex items-center gap-6">
          {/* Language switcher */}
          <div className="hidden md:flex items-center gap-1 font-label-caps text-label-caps text-secondary">
            {locales.map((loc, i) => (
              <span key={loc.code} className="flex items-center">
                <Link
                  href="/"
                  locale={loc.code as "de" | "en" | "tr"}
                  className={`px-1 transition-colors duration-200 ${
                    locale === loc.code ? "text-primary font-semibold" : "hover:text-primary"
                  }`}
                >
                  {loc.label}
                </Link>
                {i < locales.length - 1 && <span className="text-outline/50">|</span>}
              </span>
            ))}
          </div>

          {/* CTA */}
          <a
            href={GCAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all scale-95 hover:scale-100 duration-200"
          >
            {lc.navCta || t("nav.cta")}
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-primary"
            aria-label="Menü öffnen"
          >
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-surface flex flex-col items-center justify-center gap-8">
          {[
            { href: "#behandlungen", label: lc.navBehandlungen || t("nav.behandlungen") },
            { href: "#preise", label: lc.navPreise || t("nav.preise") },
            { href: "#uber-uns", label: lc.navUeberUns || t("nav.ueberUns") },
            { href: "#kontakt", label: lc.navKontakt || t("nav.kontakt") },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="flex gap-4 mt-4">
            {locales.map((loc) => (
              <Link
                key={loc.code}
                href="/"
                locale={loc.code as "de" | "en" | "tr"}
                onClick={() => setMenuOpen(false)}
                className={`font-label-caps text-label-caps px-2 py-1 ${
                  locale === loc.code ? "text-primary border-b border-primary" : "text-secondary"
                }`}
              >
                {loc.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          HERO — Instagram-style story slider
      ══════════════════════════════════════════════════════ */}
      <section className="relative h-[921px] md:h-screen w-full overflow-hidden">
        {/* Progress bars */}
        <div className="absolute top-24 left-0 w-full px-margin-mobile md:px-margin-desktop z-30 flex gap-2">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(i)}
              className="h-1 bg-white/20 flex-1 overflow-hidden cursor-pointer"
              aria-label={`Slide ${i + 1}`}
            >
              <div
                key={i === currentSlide ? `active-${slideKey}` : `idle-${i}`}
                style={i === currentSlide ? { animationDuration: `${slide.duration || 10}s` } : undefined}
                className={`h-full bg-white ${i === currentSlide ? "progress-animate" : ""} ${i < currentSlide ? "w-full" : i === currentSlide ? "w-0" : "w-0"}`}
              />
            </button>
          ))}
        </div>

        {/* Slides */}
        {heroSlides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Dark overlay */}
            <div className={`absolute inset-0 ${OVERLAYS[i % OVERLAYS.length]} z-10`} />

            {/* Background image */}
            {slide.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={slide.image}
                alt={slide.headline}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#3a3226 0%,#1a1712 100%)' }} />
            )}

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-margin-mobile md:px-margin-desktop">
              <h1 className="font-display-lg text-display-lg md:text-[80px] font-bold leading-none text-white max-w-2xl mb-6">
                {slide.headline}
              </h1>
              <p className="font-body-lg text-body-lg text-white/90 max-w-lg mb-10">
                {slide.sub}
              </p>
              <a
                href={GCAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest lux-shadow hover:bg-primary-container transition-all"
              >
                {slide.cta}
              </a>
            </div>
          </div>
        ))}

        {/* Manual slide nav dots (mobile) */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center gap-2 z-30 md:hidden">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide ? "bg-white w-6" : "bg-white/50"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SERVICES — Bento grid (asymmetric)
      ══════════════════════════════════════════════════════ */}
      <section
        id="behandlungen"
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
            {lc.servicesSectionLabel || t("services.sectionLabel")}
          </span>
          <h2 className="font-display-lg text-display-lg font-bold text-primary mb-4">
            {lc.servicesSectionTitle || t("services.sectionTitle")}
          </h2>
          <div className="w-20 h-[2px] bg-primary-fixed-dim mx-auto" />
        </div>

        {/* Bento grid — respects category visibility from admin */}
        <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-gutter h-auto md:h-[900px]">

          {/* Laser-Haarentfernung — large card (3×2) */}
          {isVisible('laser') && (
            <Link href="/laser-haarentfernung" className="md:col-span-3 md:row-span-2 group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 cursor-pointer min-h-[400px] md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getCatImage('laser') || IMG.laser} alt={getCatName('laser')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                <span className="font-label-caps text-label-caps text-primary-fixed-dim/70 mb-2 tracking-widest">{t("services.laserSeo")}</span>
                <h3 className="font-headline-lg text-headline-lg font-semibold text-white mb-2">{getCatName('laser')}</h3>
                <p className="text-white/80 font-body-sm text-body-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-4">{lc.servicesLaserDesc || t("services.laserDesc")}</p>
                <span className="text-primary-fixed-dim font-label-caps text-label-caps flex items-center gap-2">{t("services.discover")}<span className="material-symbols-outlined text-sm">arrow_forward</span></span>
              </div>
            </Link>
          )}

          {/* Gesichtsästhetik (2×1) */}
          {isVisible('gesicht') && (
            <Link href="/gesichtsaesthetik" className="md:col-span-2 md:row-span-1 group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 cursor-pointer min-h-[280px] md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getCatImage('gesicht') || IMG.facial} alt={getCatName('gesicht')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                <h3 className="font-headline-md text-headline-md font-medium text-white mb-1">{getCatName('gesicht')}</h3>
                <p className="text-white/70 font-body-sm text-body-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 mb-2">{lc.servicesFacialDesc || t("services.facialDesc")}</p>
                <span className="text-primary-fixed-dim font-label-caps text-label-caps flex items-center gap-2">{t("services.details")}<span className="material-symbols-outlined text-sm">arrow_forward</span></span>
              </div>
            </Link>
          )}

          {/* Andere (1×1) */}
          {isVisible('andere') && (
            <Link href="/andere" className="md:col-span-1 md:row-span-1 group relative overflow-hidden border border-outline-variant/30 cursor-pointer min-h-[200px] md:min-h-0" style={{ background: 'linear-gradient(135deg,#ecfdf5 0%,#6ee7b7 100%)' }}>
              {getCatImage('andere') && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={getCatImage('andere')} alt={getCatName('andere')} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4">
                <h3 className="font-headline-sm font-medium text-white text-[16px]">{getCatName('andere')}</h3>
              </div>
              {!getCatImage('andere') && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity">
                  <span className="material-symbols-outlined text-on-surface" style={{ fontSize: '64px' }}>spa</span>
                </div>
              )}
            </Link>
          )}

          {/* Body Contouring (1×1) */}
          {isVisible('body') && (
            <Link href="/body-contouring" className="md:col-span-1 md:row-span-1 group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 cursor-pointer min-h-[200px] md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getCatImage('body') || IMG.body} alt={getCatName('body')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-headline-sm font-medium text-white text-[16px]">{getCatName('body')}</h3>
              </div>
            </Link>
          )}

          {/* Injectables (1×1) */}
          {isVisible('inject') && (
            <Link href="/injectables" className="md:col-span-1 md:row-span-1 group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 cursor-pointer min-h-[200px] md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getCatImage('inject') || IMG.injectables} alt={getCatName('inject')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-headline-sm font-medium text-white text-[16px]">{getCatName('inject')}</h3>
              </div>
            </Link>
          )}

          {/* Maniküre (1×1) */}
          {isVisible('mani') && (
            <Link href="/manikure-pedikure" className="md:col-span-1 md:row-span-1 group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 cursor-pointer min-h-[200px] md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getCatImage('mani') || IMG.mani} alt={getCatName('mani')} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-headline-sm font-medium text-white text-[16px]">{getCatName('mani')}</h3>
              </div>
            </Link>
          )}

        </div>

        {/* Custom categories (not in original 6) */}
        {customCats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mt-gutter">
            {customCats.map(cat => {
              const slug = FRONTEND_SLUG[cat.id] ?? cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/${slug}`}
                  className="group relative overflow-hidden bg-surface-container-lowest border border-outline-variant/30 cursor-pointer min-h-[200px] flex flex-col items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#fff8e7 0%,#f5e5a0 100%)' }}
                >
                  {cat.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <span className="material-symbols-outlined text-[48px] text-primary/30 group-hover:text-primary/50 transition-colors">{cat.icon}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                    <h3 className="font-headline-sm font-medium text-white text-[16px]">{cat.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          PROMO — Kombi-Paket campaign section
      ══════════════════════════════════════════════════════ */}
      <section
        id="preise"
        className="mb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto space-y-8"
      >
        {promoBanners.map((banner) => (
          <div key={banner.id} className="relative w-full min-h-[400px] overflow-hidden group border border-outline-variant/30">
            <div className="absolute inset-0 bg-secondary-container/30 z-10" />
            <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between z-20 px-8 md:px-24">
              {/* Text */}
              <div className="text-center md:text-left max-w-xl py-12 md:py-16">
                <span className="font-label-caps text-label-caps text-primary tracking-[0.3em] mb-4 block">
                  {banner.label}
                </span>
                <h2 className="font-display-lg text-display-lg font-bold text-on-surface mb-6 leading-tight whitespace-pre-line">
                  {banner.title}
                </h2>
                <p className="font-body-md text-body-md text-secondary mb-8 max-w-md">
                  {banner.desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={GCAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all text-center"
                  >
                    {banner.ctaPrimary}
                  </a>
                  {banner.ctaSecondary && (
                    <a
                      href="#behandlungen"
                      className="border border-primary text-primary px-8 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary/5 transition-all text-center"
                    >
                      {banner.ctaSecondary}
                    </a>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="hidden md:block w-[380px] h-[400px] relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 shadow-2xl" style={{ background: 'linear-gradient(135deg,#f6f3f2,#e5e2dc)' }} />
                {banner.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={banner.image}
                    alt={banner.title}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-cover shadow-2xl scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════
          ÜBER UNS — About section
      ══════════════════════════════════════════════════════ */}
      <section
        id="uber-uns"
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
              {lc.aboutSectionLabel || t("about.sectionLabel")}
            </span>
            <h2 className="font-display-lg text-headline-lg font-semibold text-on-surface mb-6 leading-tight">
              {lc.aboutTitle || t("about.title")}
            </h2>
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

      {/* ══════════════════════════════════════════════════════
          KONTAKT — Contact & location
      ══════════════════════════════════════════════════════ */}
      <section
        id="kontakt"
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
      >
        <div className="text-center mb-16">
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
            {lc.contactSectionLabel || t("contact.sectionLabel")}
          </span>
          <h2 className="font-display-lg text-headline-lg font-semibold text-on-surface mb-4">
            {lc.contactTitle || t("contact.title")}
          </h2>
          <div className="w-20 h-[2px] bg-primary-fixed-dim mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">

          {/* Address card */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
              {lc.contactAddressTitle || t("contact.addressTitle")}
            </h3>
            <address className="font-body-sm text-body-sm text-secondary not-italic whitespace-pre-line">
              {displayAddress}
            </address>
          </div>

          {/* Hours card */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">schedule</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
              {lc.contactHoursTitle || t("contact.hoursTitle")}
            </h3>
            <p className="font-body-sm text-body-sm text-secondary whitespace-pre-line">
              {displayHours}
            </p>
          </div>

          {/* Phone card */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">phone</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-medium text-on-surface">
              {lc.contactPhoneTitle || t("contact.phoneTitle")}
            </h3>
            <a
              href={`tel:${phoneHref}`}
              className="font-body-sm text-body-sm text-secondary hover:text-primary transition-colors"
            >
              {displayPhone}
            </a>
          </div>
        </div>

        {/* CTA buttons row */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
          <a
            href={GCAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all text-center lux-shadow"
          >
            {t("contact.ctaCalendar")}
          </a>
          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-primary text-primary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:bg-primary/5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            {t("contact.ctaWhatsapp")}
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-outline-variant text-secondary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:border-primary hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined text-sm">map</span>
            {t("contact.ctaMaps")}
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full px-margin-mobile md:px-margin-desktop py-section-gap">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">

          {/* Brand col */}
          <div className="flex flex-col gap-6">
            <div className="font-display-lg text-headline-md tracking-widest text-primary">
              EPILISSE
            </div>
            <p className="font-body-sm text-body-sm text-secondary max-w-xs">
              {lc.footerTagline || t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-primary hover:scale-110 transition-transform" aria-label="Facebook">
                <span className="material-symbols-outlined">brand_family</span>
              </a>
              <a href="#" className="text-primary hover:scale-110 transition-transform" aria-label="Instagram">
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
              <a href="#" className="text-primary hover:scale-110 transition-transform" aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </a>
            </div>
          </div>

          {/* Behandlungen */}
          <div>
            <h4 className="font-headline-sm text-headline-sm font-medium text-primary mb-6">
              {lc.footerBehandlungenTitle || t("footer.behandlungenTitle")}
            </h4>
            <ul className="flex flex-col gap-4 font-body-sm text-body-sm text-secondary">
              {[
                t("services.laser"),
                t("services.facial"),
                t("services.body"),
                t("services.mani"),
              ].map((item) => (
                <li key={item}>
                  <a href="#behandlungen" className="hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio */}
          <div>
            <h4 className="font-headline-sm text-headline-sm font-medium text-primary mb-6">
              {lc.footerStudioTitle || t("footer.studioTitle")}
            </h4>
            <ul className="flex flex-col gap-4 font-body-sm text-body-sm text-secondary">
              <li className="whitespace-pre-line">{displayAddress}</li>
              <li className="whitespace-pre-line">{displayHours}</li>
              <li>
                <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                  {displayPhone}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-headline-sm text-headline-sm font-medium text-primary mb-6">
              {lc.footerLegalTitle || t("footer.legalTitle")}
            </h4>
            <ul className="flex flex-col gap-4 font-body-sm text-body-sm text-secondary">
              {[
                { key: "footer.impressum", href: "#" },
                { key: "footer.datenschutz", href: "#" },
                { key: "footer.agb", href: "#" },
                { key: "footer.karriere", href: "#" },
              ].map((item) => (
                <li key={item.key}>
                  <a href={item.href} className="hover:text-primary transition-colors">
                    {t(item.key as Parameters<typeof t>[0])}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-[1440px] mx-auto border-t border-outline-variant/30 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-body-sm text-body-sm text-secondary">
            {lc.footerCopyright || t("footer.copyright")}
          </span>
          <div className="flex gap-8 items-center">
            <span className="font-label-caps text-[10px] text-secondary/60 tracking-widest">
              {lc.footerBadge1 || t("footer.badge1")}
            </span>
            <span className="font-label-caps text-[10px] text-secondary/60 tracking-widest">
              {lc.footerBadge2 || t("footer.badge2")}
            </span>
            <a
              href={`/${locale}/admin`}
              className="font-label-caps text-[10px] text-secondary/40 hover:text-primary transition-colors tracking-widest flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
              Admin
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}
