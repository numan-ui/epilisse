"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { FRONTEND_SLUG, PSEUDO_CATEGORY_IDS } from "@/app/[locale]/admin/behandlungen/data";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import AnnouncementBar from "@/components/AnnouncementBar";

/**
 * Single shared footer for every public page — brand/social, the same
 * category list as /behandlungen, studio contact, bottom bar (copyright +
 * legal links + admin link), and the static AnnouncementBar strip underneath.
 */
export default function SiteFooter() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) ?? "de";

  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const categories = useAdminCategories();

  const displayPhone = settings.phone || t("contact.phone");
  const phoneHref = displayPhone.replace(/\s/g, "");
  const displayAddress = settings.address || t("contact.address");
  const instagramHandle = settings.instagram.replace(/^@/, "");

  // The pre-PMU default is still saved in the CMS; treat it as unset so the current default shows.
  const LEGACY_TAGLINE = "Ihr Experte für exklusive Schönheit und dauerhafte Haarentfernung im Herzen von München. Qualität, Diskretion und Perfektion.";
  const savedTagline = lc.footerTagline?.trim() === LEGACY_TAGLINE ? "" : lc.footerTagline;

  // Same set and order as the /behandlungen grid, so the two never drift apart.
  const visibleCats = categories.filter((c) => c.visible && !PSEUDO_CATEGORY_IDS.includes(c.id));

  // settings.hours runs Monday → Sunday. Client-only (visitor's clock) to avoid a hydration mismatch.
  const [todayIdx, setTodayIdx] = useState<number | null>(null);
  useEffect(() => setTodayIdx((new Date().getDay() + 6) % 7), []);
  const today = todayIdx === null ? undefined : settings.hours[todayIdx];

  const headingCls = "flex items-center gap-2.5 font-label-caps text-label-caps uppercase text-primary tracking-[0.2em] mb-6";
  const headingDot = <span className="w-1.5 h-1.5 rounded-full bg-primary" />;
  const linkCls = "hover:text-primary transition-colors";
  const colCls = "py-8 md:py-2 md:px-10 first:md:pl-0 last:md:pr-0";

  return (
    <>
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full px-margin-mobile md:px-margin-desktop pt-16 md:pt-20 pb-16">

        {/* Masthead — the wordmark carries the footer, everything else stays quiet */}
        <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
          {/* Emblem + wordmark double as the way back to the top of the homepage */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={settings.name}
            className="group flex flex-col items-center"
          >
            <span className="footer-emblem mb-6" style={{ aspectRatio: "458 / 640" }}>
              <Image
                src="/images/epilisse-emblem.webp"
                alt=""
                width={458}
                height={640}
                unoptimized
                loading="lazy"
              />
            </span>
            <span className="font-display-lg text-[34px] md:text-[44px] leading-none tracking-[0.28em] pl-[0.28em] text-primary">
              {settings.name}
            </span>
          </Link>
          <div className="flex items-center gap-3 my-6" aria-hidden="true">
            <span className="w-14 h-px bg-primary/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="w-14 h-px bg-primary/50" />
          </div>
          <p className="font-display-lg text-[18px] md:text-[20px] leading-relaxed text-on-surface-variant max-w-2xl text-balance">
            {savedTagline || t("footer.tagline")}
          </p>
        </div>

        <div className="max-w-[1180px] mx-auto mt-12 md:mt-16 mb-12 md:mb-14 grid grid-cols-1 md:grid-cols-[1.35fr_1fr_1fr] divide-y md:divide-y-0 md:divide-x divide-outline-variant/50">

          {/* Behandlungen — splits into two columns once the list gets long */}
          <div className={colCls}>
            <h4 className={headingCls}>
              {headingDot}
              {lc.footerBehandlungenTitle || t("footer.behandlungenTitle")}
            </h4>
            <ul className={`font-body-md text-body-md text-secondary gap-x-8 ${visibleCats.length > 4 ? "columns-2" : ""}`}>
              {visibleCats.map((cat) => (
                <li key={cat.id} className="mb-3 break-inside-avoid">
                  <Link href={`/${FRONTEND_SLUG[cat.id] ?? cat.id}`} className={linkCls}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio */}
          <div className={colCls}>
            <h4 className={headingCls}>
              {headingDot}
              {lc.footerStudioTitle || t("footer.studioTitle")}
            </h4>
            <div className="flex flex-col gap-3 font-body-md text-body-md text-secondary">
              <address className="not-italic whitespace-pre-line">{displayAddress}</address>
              <span className="min-h-[1.5em] tabular-nums">
                {today && `${today.day}: ${today.closed ? "Geschlossen" : `${today.open} – ${today.close} Uhr`}`}
              </span>
              <Link href="/kontakt" className={`${linkCls} text-primary`}>
                {t("contact.hoursTitle")} →
              </Link>
            </div>
          </div>

          {/* Kontakt */}
          <div className={colCls}>
            <h4 className={headingCls}>
              {headingDot}
              {lc.navKontakt || t("nav.kontakt")}
            </h4>
            <div className="flex flex-col gap-4 items-start">
              <a
                href={`tel:${phoneHref}`}
                className="font-display-lg text-[24px] leading-tight text-on-surface hover:text-primary transition-colors tabular-nums"
              >
                {displayPhone}
              </a>
              <a
                href={`https://instagram.com/${instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 font-body-md text-body-md text-secondary hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
                </svg>
                @{instagramHandle}
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="max-w-[1440px] mx-auto border-t border-outline-variant/30 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 font-body-sm text-body-sm text-secondary">
          <span>{lc.footerCopyright || t("footer.copyright", { name: settings.name })}</span>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            {[
              { key: "footer.impressum", href: `/${locale}/impressum` },
              { key: "footer.datenschutz", href: `/${locale}/datenschutz` },
              { key: "footer.agb", href: `/${locale}/agb` },
              { key: "footer.karriere", href: `/${locale}/karriere` },
            ].map((item) => (
              <a key={item.key} href={item.href} className={linkCls}>
                {t(item.key as Parameters<typeof t>[0])}
              </a>
            ))}
            <a
              href={`/${locale}/admin`}
              className="text-secondary/40 hover:text-primary transition-colors flex items-center"
              aria-label="Admin"
            >
              <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Same utility strip, mirrored as a static band under the footer */}
      <AnnouncementBar variant="static" />
    </>
  );
}
