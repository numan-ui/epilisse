"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
import { useBookingModal } from "@/context/BookingModalContext";
import SmartImage from "@/components/SmartImage";
import GoldDustEffect from "@/components/GoldDustEffect";

/* ── Image constants (Stitch AI – replace with real salon photos) ── */
const IMG = {
  laser:
    "/images/laser-hair-removal.png",
  facial:
    "/images/gesichtsaesthetik.png",
  body: "/images/body-contouring.png",
  injectables:
    "/images/injectables.png",
  mani: "/images/manikure-pedikure.png",
  about:
    "/images/about-studio.png",
};

/* ── Hero slide overlays ────────────────────────────────────── */
const OVERLAYS = [
  "bg-black/30",
  "bg-black/40",
  "bg-black/20",
  "bg-black/30",
];

/* ── Original fallback images (replaced by admin settings when set) ── */
const ORIG_IDS = ['laser', 'gesicht', 'body', 'inject', 'mani'];

/* ── Core category display order/links/fallback images for the equal-width services grid ── */
const CORE_CAT_ORDER = ['laser', 'gesicht', 'body', 'inject', 'mani'] as const;
const CORE_CAT_HREF: Record<string, string> = {
  laser: '/laser-haarentfernung',
  gesicht: '/gesichtsaesthetik',
  body: '/body-contouring',
  inject: '/injectables',
  mani: '/manikure-pedikure',
};
const CORE_CAT_IMG: Record<string, string> = {
  laser: IMG.laser,
  gesicht: IMG.facial,
  body: IMG.body,
  inject: IMG.injectables,
  mani: IMG.mani,
};

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
  const booking = useBookingModal();

  /* ── Dynamic booking URLs from admin settings ─── */
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
  const getCatDesc  = (id: string) => categories.find(c => c.id === id)?.desc || '';

  /* ── Bento grid: visible original cats + custom cats ─── */
  const visibleCats  = categories.filter(c => c.visible);
  const customCats   = visibleCats.filter(c => !ORIG_IDS.includes(c.id));
  const isVisible    = (id: string) => categories.find(c => c.id === id)?.visible !== false;
  const getCatName   = (id: string) => categories.find(c => c.id === id)?.name ?? '';
  const getCatKicker = (id: string) => categories.find(c => c.id === id)?.kicker || 'BEHANDLUNG';

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 });

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroParallax({ x: px * -48, y: py * -48 });
  };

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
        <a href="#" className="font-display-lg text-[26px] tracking-wide epilisse-logo">
          {settings.name}
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/behandlungen" className="font-label-caps text-label-caps font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">
            {lc.navBehandlungen || t("nav.behandlungen")}
          </Link>
          <Link href="/preise" className="font-label-caps text-label-caps font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">
            {lc.navPreise || t("nav.preise")}
          </Link>
          <Link href="/ueber-uns" className="font-label-caps text-label-caps font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">
            {lc.navUeberUns || t("nav.ueberUns")}
          </Link>
          <a href="#kontakt" className="font-label-caps text-label-caps font-semibold text-on-surface-variant hover:text-primary transition-colors duration-300">
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
                  locale={loc.code as "de" | "en"}
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
          <button
            type="button"
            onClick={() => booking.open()}
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all scale-95 hover:scale-100 duration-200"
          >
            {lc.navCta || t("nav.cta")}
          </button>

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
            { href: "/behandlungen", label: lc.navBehandlungen || t("nav.behandlungen"), internal: true },
            { href: "/preise", label: lc.navPreise || t("nav.preise"), internal: true },
            { href: "/ueber-uns", label: lc.navUeberUns || t("nav.ueberUns"), internal: true },
            { href: "#kontakt", label: lc.navKontakt || t("nav.kontakt"), internal: false },
          ].map((item) =>
            item.internal ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-headline-md text-headline-md text-on-surface hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            )
          )}
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
      <section
        className="relative h-[921px] md:h-screen w-full overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={() => setHeroParallax({ x: 0, y: 0 })}
      >
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

            {/* Background image — Ken Burns zoom (img) + cursor parallax (wrapper) for depth.
                Gradient behind the image covers the gap before it paints (otherwise the dark
                overlay above sits on transparent/white and reads as a flat gray box), and only
                the currently-visible slide gets `priority` so it isn't competing for bandwidth
                with off-screen slides' images. */}
            {slide.image ? (
              <div
                className="absolute -inset-16"
                style={{
                  background: 'linear-gradient(135deg,#3a3226 0%,#1a1712 100%)',
                  ...(i === currentSlide
                    ? {
                        transform: `translate3d(${heroParallax.x}px, ${heroParallax.y}px, 0)`,
                        transition: "transform 0.6s ease-out",
                      }
                    : undefined),
                }}
              >
                <SmartImage
                  src={slide.image}
                  alt={slide.headline}
                  className={`brand-photo object-cover ${i === currentSlide ? "kenburns" : ""}`}
                  style={i === currentSlide ? { animationDuration: `${(slide.duration || 10) + 2}s` } : undefined}
                  sizes="100vw"
                  priority={i === currentSlide}
                />
              </div>
            ) : (
              <div className="w-full h-full" style={{ background: 'linear-gradient(135deg,#3a3226 0%,#1a1712 100%)' }} />
            )}

            {/* Gold dust cursor trail — decorative, first slide only */}
            {i === 0 && <GoldDustEffect active={i === currentSlide} />}

            {/* Content */}
            <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-margin-mobile md:px-margin-desktop">
              <motion.h1
                key={`h-${slideKey}`}
                initial={{ opacity: 0, y: 24 }}
                animate={i === currentSlide ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="font-display-lg text-display-lg md:text-[80px] font-bold leading-none text-white max-w-2xl mb-6"
              >
                {slide.headline}
              </motion.h1>
              <motion.p
                key={`p-${slideKey}`}
                initial={{ opacity: 0, y: 24 }}
                animate={i === currentSlide ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="font-body-lg text-body-lg text-white/90 max-w-lg mb-10"
              >
                {slide.sub}
              </motion.p>
              <motion.button
                key={`b-${slideKey}`}
                type="button"
                initial={{ opacity: 0, y: 24 }}
                animate={i === currentSlide ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                onClick={() => booking.open()}
                className="bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest lux-shadow hover:bg-primary-container transition-all"
              >
                {slide.cta}
              </motion.button>
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
          SERVICES — Equal-width category grid
      ══════════════════════════════════════════════════════ */}
      <section
        id="behandlungen"
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
            {lc.servicesSectionLabel || t("services.sectionLabel")}
          </span>
          <h2 className="font-display-lg text-display-lg font-bold text-primary mb-4">
            {lc.servicesSectionTitle || t("services.sectionTitle")}
          </h2>
          <div className="w-20 h-[2px] bg-primary-fixed-dim mx-auto" />
        </motion.div>

        {/* Every visible category — core + custom — strictly uniform cards, 3 per row, identical geometry */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter"
        >
          {CORE_CAT_ORDER.filter(isVisible).map(id => (
            <Link
              key={id}
              href={CORE_CAT_HREF[id]}
              className="bento-card group bg-surface-container-lowest border border-outline-variant/30 cursor-pointer flex flex-col"
            >
              <div className="relative overflow-hidden aspect-square">
                <SmartImage
                  src={getCatImage(id) || CORE_CAT_IMG[id]}
                  alt={getCatName(id)}
                  className="brand-photo object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <div className="p-6">
                <span className="font-label-caps text-[10px] text-primary tracking-widest block mb-2">
                  {getCatKicker(id)}
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{getCatName(id)}</h3>
                <p className="font-body-sm text-body-sm text-secondary">{getCatDesc(id)}</p>
              </div>
            </Link>
          ))}

          {customCats.map(cat => {
            const slug = FRONTEND_SLUG[cat.id] ?? cat.id;
            return (
              <Link
                key={cat.id}
                href={`/${slug}`}
                className="bento-card group bg-surface-container-lowest border border-outline-variant/30 cursor-pointer flex flex-col"
              >
                <div className="relative overflow-hidden aspect-square">
                  {cat.image ? (
                    <SmartImage
                      src={cat.image}
                      alt={cat.name}
                      className="brand-photo object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fff8e7 0%,#f5e5a0 100%)' }}>
                      <span className="material-symbols-outlined text-[48px] text-primary/30">{cat.icon}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="font-label-caps text-[10px] text-primary tracking-widest block mb-2">{cat.kicker || 'BEHANDLUNG'}</span>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{cat.name}</h3>
                  <p className="font-body-sm text-body-sm text-secondary">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PROMO — Kombi-Paket campaign section
      ══════════════════════════════════════════════════════ */}
      <section
        id="preise"
        className="mb-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto space-y-8"
      >
        {promoBanners.map((banner) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="bento-card relative w-full min-h-[400px] overflow-hidden group border border-outline-variant/30"
          >
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
                  <button
                    type="button"
                    onClick={() => booking.open()}
                    className="bg-primary text-on-primary px-8 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all text-center"
                  >
                    {banner.ctaPrimary}
                  </button>
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
                  <SmartImage
                    src={banner.image}
                    alt={banner.title}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                    className="brand-photo object-cover shadow-2xl scale-110 group-hover:scale-100 transition-transform duration-1000"
                    sizes="380px"
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════
          ÜBER UNS — About section
      ══════════════════════════════════════════════════════ */}
      <section
        id="uber-uns"
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
        >
          {/* Left: text */}
          <div>
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] block mb-3">
              {lc.aboutSectionLabel || t("about.sectionLabel", { name: settings.name })}
            </span>
            <h2 className="font-display-lg text-headline-lg font-semibold text-on-surface mb-6 leading-tight">
              {lc.aboutTitle || t("about.title")}
            </h2>
            <p className="font-body-lg text-body-lg text-secondary mb-10">
              {lc.aboutDesc || t("about.desc", { name: settings.name })}
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
          <div className="bento-card group relative overflow-hidden rounded-xl aspect-[4/5]">
            <SmartImage
              src={aboutImg}
              alt="EPILISSE Studio München"
              className="brand-photo object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-label-caps text-label-caps text-white/80 tracking-widest">
                MÜNCHEN · LUXURY BEAUTY CARE
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          KONTAKT — Contact & location
      ══════════════════════════════════════════════════════ */}
      <section
        id="kontakt"
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-label-caps text-label-caps text-primary tracking-[0.3em]">
              {lc.contactSectionLabel || t("contact.sectionLabel")}
            </span>
            <span className="w-16 h-[2px] bg-primary" />
          </div>
          <h2 className="font-display-lg text-headline-lg font-semibold text-on-surface">
            {lc.contactTitle || t("contact.title")}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
        >

          {/* Address card */}
          <div className="bento-card bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col gap-4">
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
          <div className="bento-card bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col gap-4">
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
          <div className="bento-card bg-surface-container-low border border-outline-variant/30 p-8 flex flex-col gap-4">
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
        </motion.div>

        {/* CTA buttons row */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
          <button
            type="button"
            onClick={() => booking.open()}
            className="bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all text-center lux-shadow"
          >
            {t("contact.ctaCalendar")}
          </button>
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
              {settings.name}
            </div>
            <p className="font-body-sm text-body-sm text-secondary max-w-xs">
              {lc.footerTagline || t("footer.tagline")}
            </p>
            <div className="flex gap-4">
              <a
                href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:scale-110 transition-transform"
                aria-label="Instagram"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
                </svg>
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
                ...CORE_CAT_ORDER.filter(isVisible).map(id => ({ key: id, name: getCatName(id), href: CORE_CAT_HREF[id] })),
                ...customCats.map(cat => ({ key: cat.id, name: cat.name, href: `/${FRONTEND_SLUG[cat.id] ?? cat.id}` })),
              ].map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.name}
                  </Link>
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
              <li>
                <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                  {displayPhone}
                </a>
              </li>
              <li>
                <a href="#kontakt" className="hover:text-primary transition-colors">
                  {t("contact.addressTitle")} &amp; {t("contact.hoursTitle")} →
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
                { key: "footer.impressum", href: `/${locale}/impressum` },
                { key: "footer.datenschutz", href: `/${locale}/datenschutz` },
                { key: "footer.agb", href: `/${locale}/agb` },
                { key: "footer.karriere", href: `/${locale}/karriere` },
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
            {lc.footerCopyright || t("footer.copyright", { name: settings.name })}
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
