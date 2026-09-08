import { INIT_SETTINGS } from "@/app/[locale]/admin/behandlungen/data";
import { SITE_URL } from "@/lib/seo";

const DAY_EN: Record<string, string> = {
  Montag: "Monday",
  Dienstag: "Tuesday",
  Mittwoch: "Wednesday",
  Donnerstag: "Thursday",
  Freitag: "Friday",
  Samstag: "Saturday",
  Sonntag: "Sunday",
};

export default function LocalBusinessSchema() {
  const s = INIT_SETTINGS;

  const openingHours = s.hours
    .filter((d) => !d.closed)
    .map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_EN[d.day] ?? d.day,
      opens: d.open,
      closes: d.close,
    }));

  // Real ratings (Google + Treatwell). German comma → dot for schema.org; a
  // count is required for a valid AggregateRating, so pull the first integer
  // out of either count field and omit the block entirely if none is set.
  const ratingValue = (s.googleRating || s.treatwellRating || "").replace(",", ".");
  const reviewCount = (s.googleReviewCount || s.treatwellReviewCount || "").replace(/\D/g, "");
  const aggregateRating =
    ratingValue && reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue,
          reviewCount,
          bestRating: "5",
          worstRating: "1",
        }
      : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: s.name,
    image: `${SITE_URL}/opengraph-image`,
    url: SITE_URL,
    telephone: s.phone,
    email: s.email,
    priceRange: "€€",
    ...(aggregateRating ? { aggregateRating } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Berlepschstraße 2",
      postalCode: "81373",
      addressLocality: "München",
      addressCountry: "DE",
    },
    openingHoursSpecification: openingHours,
    sameAs: [
      s.instagram ? `https://instagram.com/${s.instagram.replace(/^@/, "")}` : null,
      s.facebook ? `https://facebook.com/${s.facebook}` : null,
      s.tiktok ? `https://tiktok.com/${s.tiktok.replace(/^@/, "")}` : null,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
