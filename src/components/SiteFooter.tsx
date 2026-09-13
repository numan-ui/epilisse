"use client";

import { Link } from "@/i18n/navigation";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";

/**
 * Shared footer for pages that don't have their own bespoke one
 * (legal/utility pages: agb, datenschutz, impressum, karriere,
 * einwilligung, behandlungseinwilligung, kontakt). Mirrors the footer
 * already duplicated in ServicePageTemplate/behandlungen/preise/ueber-uns.
 */
export default function SiteFooter() {
  const settings = useAdminSettings();
  const lc = useAdminLandingContent();

  return (
    <footer className="bg-surface-container-highest w-full px-margin-mobile md:px-margin-desktop pt-12 pb-16 grid grid-cols-1 md:grid-cols-4 gap-gutter border-t border-outline-variant">
      <div>
        <Link href="/" className="font-display-lg text-[26px] text-primary tracking-wide font-bold mb-6 block">
          {settings.name}
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
        {[
          { label: "Impressum", href: "/impressum" },
          { label: "Datenschutz", href: "/datenschutz" },
          { label: "AGB", href: "/agb" },
          { label: "Karriere", href: "/karriere" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="font-body-sm text-secondary hover:text-primary transition-colors">
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Kontakt</h4>
        <span className="font-body-sm text-secondary">{settings.address}</span>
        <span className="font-body-sm text-secondary">{settings.phone}</span>
        <span className="font-body-sm text-secondary">{settings.email}</span>
      </div>
    </footer>
  );
}
