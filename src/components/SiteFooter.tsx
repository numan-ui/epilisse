"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { FRONTEND_SLUG, PSEUDO_CATEGORY_IDS } from "@/app/[locale]/admin/behandlungen/data";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import AnnouncementBar from "@/components/AnnouncementBar";

const ORIG_IDS = ["laser", "gesicht", "mani"];
const CORE_CAT_ORDER = ["laser", "gesicht", "mani"] as const;
const CORE_CAT_HREF: Record<string, string> = {
  laser: "/laser-haarentfernung",
  gesicht: "/gesichtsaesthetik",
  mani: "/manikure-pedikure",
};

/**
 * Single shared footer for every public page — brand/social, dynamic
 * category list, studio contact, legal links, bottom bar (copyright +
 * badges + admin link), and the static AnnouncementBar strip underneath.
 * Mirrors what used to be the homepage-only footer.
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

  const visibleCats = categories.filter((c) => c.visible && !PSEUDO_CATEGORY_IDS.includes(c.id));
  const customCats = visibleCats.filter((c) => !ORIG_IDS.includes(c.id));
  const isVisible = (id: string) => categories.find((c) => c.id === id)?.visible !== false;
  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name ?? "";

  return (
    <>
      <footer className="bg-surface-container-highest border-t border-outline-variant w-full px-margin-mobile md:px-margin-desktop pt-12 pb-16">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">

          {/* Brand col */}
          <div className="flex flex-col gap-6">
            <div className="font-display-lg text-headline-md tracking-widest text-primary">
              {settings.name}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
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
                { key: "aktionen", name: lc.navAktionen || t("nav.aktionen"), href: "/aktionen" },
                ...CORE_CAT_ORDER.filter(isVisible).map((id) => ({ key: id, name: getCatName(id), href: CORE_CAT_HREF[id] })),
                ...customCats.map((cat) => ({ key: cat.id, name: cat.name, href: `/${FRONTEND_SLUG[cat.id] ?? cat.id}` })),
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
                <Link href="/kontakt" className="hover:text-primary transition-colors">
                  {t("contact.addressTitle")} &amp; {t("contact.hoursTitle")} →
                </Link>
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

      {/* Same utility strip, mirrored as a static band under the footer */}
      <AnnouncementBar variant="static" />
    </>
  );
}
