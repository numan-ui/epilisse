import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, SEO_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return SEO_ROUTES.map((route) => ({
    url: `${SITE_URL}/${routing.defaultLocale}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${route}`])
      ),
    },
  }));
}
