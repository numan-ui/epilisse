"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

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
  campaign1: Campaign;
  campaign2: Campaign;
}

interface Props extends ServicePageData {
  locale: string;
}

const GCAL_URL = "https://calendar.google.com";

const LOCALES = [
  { code: "de", label: "DE" },
  { code: "en", label: "EN" },
] as const;

const NAV_LINKS = [
  { href: "/#behandlungen", label: "Behandlungen" },
  { href: "/#preise", label: "Preise" },
  { href: "/#uber-uns", label: "Über Uns" },
  { href: "/#kontakt", label: "Kontakt" },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function ServicePageTemplate({ locale, ...data }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 glass-nav bg-surface/95 border-b border-outline-variant/30 lux-shadow">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display-lg text-headline-md tracking-widest text-primary">
            EPILISSE
          </Link>
          <div className="hidden md:flex gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-label-caps text-label-caps text-secondary hover:text-primary transition-colors duration-300"
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
          <a
            href={GCAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
          >
            Termin Buchen
          </a>
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
              <a
                href={GCAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary text-on-primary px-10 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
              >
                Termin Buchen
              </a>
            </div>
          </div>
        </section>

        {/* ── CAMPAIGN BANNERS ─────────────────────────────────────────── */}
        <section className="max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop my-section-gap space-y-8">

          {/* Campaign 1 — primary-container */}
          <div className="relative overflow-hidden lux-shadow border border-outline-variant/30">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 md:p-20 bg-primary-container text-on-primary-container flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <span className="material-symbols-outlined text-[180px]">{data.campaign1.icon}</span>
                </div>
                <span className="font-label-caps text-label-caps tracking-[0.4em] mb-4">
                  {data.campaign1.label}
                </span>
                <h2 className="font-headline-lg text-display-lg mb-6 text-on-primary-container leading-tight">
                  {data.campaign1.title}
                </h2>
                <p className="font-body-lg text-body-lg mb-10 opacity-90">{data.campaign1.body}</p>
                <div>
                  <a
                    href={GCAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-on-primary-container text-primary-container px-10 py-4 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-all"
                  >
                    {data.campaign1.cta}
                  </a>
                </div>
              </div>
              <div
                className="h-[380px] md:h-auto bg-cover bg-center"
                style={{ backgroundImage: `url('${data.campaign1.image}')` }}
              />
            </div>
          </div>

          {/* Campaign 2 — surface-container-low, image left */}
          <div className="relative overflow-hidden lux-shadow border border-outline-variant/30">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div
                className="h-[380px] md:h-auto bg-cover bg-center order-last md:order-first"
                style={{ backgroundImage: `url('${data.campaign2.image}')` }}
              />
              <div className="p-12 md:p-20 bg-surface-container-low text-on-surface flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <span className="material-symbols-outlined text-[180px]">{data.campaign2.icon}</span>
                </div>
                <span className="font-label-caps text-label-caps tracking-[0.4em] mb-4 text-primary">
                  {data.campaign2.label}
                </span>
                <h2 className="font-headline-lg text-display-lg mb-6 leading-tight">{data.campaign2.title}</h2>
                <p className="font-body-lg text-body-lg mb-10 text-secondary">{data.campaign2.body}</p>
                <div>
                  <a
                    href={GCAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-on-primary px-10 py-4 font-label-caps text-label-caps tracking-widest hover:bg-primary-container transition-all"
                  >
                    {data.campaign2.cta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-highest w-full px-margin-mobile md:px-margin-desktop py-section-gap grid grid-cols-1 md:grid-cols-4 gap-gutter border-t border-outline-variant">
        <div>
          <Link href="/" className="font-display-lg text-headline-md text-primary tracking-widest mb-6 block">
            EPILISSE
          </Link>
          <p className="font-body-sm text-secondary leading-relaxed">
            Ihre Experten für dauerhafte Haarentfernung und ästhetische Hautbehandlungen im Herzen von München.
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
          <span className="font-body-sm text-secondary">Adresse Placeholder, München</span>
          <span className="font-body-sm text-secondary">+49 (0) 89 XXX XXX XX</span>
          <span className="font-body-sm text-secondary">info@epilisse-munich.de</span>
        </div>
      </footer>
    </div>
  );
}
