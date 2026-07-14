import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://epilisse.vercel.app").replace(/\/$/, "");

/** Static, locale-independent routes indexed for search engines. */
export const SEO_ROUTES = [
  "",
  "/behandlungen",
  "/preise",
  "/ueber-uns",
  "/laser-haarentfernung",
  "/gesichtsaesthetik",
  "/body-contouring",
  "/injectables",
  "/manikure-pedikure",
  "/datenschutz",
];

/**
 * Per-page title/description/keywords + matching canonical, hreflang, OG and
 * Twitter metadata — so each service page targets its own keywords instead of
 * every page sharing the homepage's title (which reads as duplicate content
 * to search engines and dilutes each page's own ranking chance).
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  keywords,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
        "x-default": `/${routing.defaultLocale}${path}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "en" ? "en_US" : "de_DE",
      siteName: "EPILISSE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
