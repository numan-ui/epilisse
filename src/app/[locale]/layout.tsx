import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BookingModalProvider } from "@/context/BookingModalContext";
import BookingModal from "@/components/BookingModal";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import { SITE_URL, buildMetadata } from "@/lib/seo";
import "../globals.css";

/* display: "optional" — avoids the visible fallback→real-font size-adjust "pop" that "swap"
   causes on Playfair Display (the fallback's size-adjust never matches this typeface's metrics
   exactly). With "optional" the browser shows either the real font (if it loads in ~100ms,
   e.g. already cached) or sticks with the fallback for that page load — no mid-render swap. */
/* Only "normal" style and only the weights actually used anywhere in the app (verified via
   grep for `italic` and `font-light` — neither is used) — every extra weight/style is a
   separate font file the browser has to fetch before it can stop showing the fallback, which
   widens the visible-swap window on slow connections. */
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-playfair-display",
  display: "optional",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "optional",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(SITE_URL),
    ...buildMetadata({
      locale,
      path: "",
      title: "EPILISSE – Laser-Haarentfernung & Kosmetikstudio München",
      description:
        "Premium Kosmetikstudio in München. Dauerhafte Laser-Haarentfernung, Hydrafacial, Gesichtsästhetik & mehr. Termin online buchen.",
      keywords: [
        "Laser-Haarentfernung München",
        "Kosmetikstudio München",
        "Hydrafacial München",
        "Gesichtsästhetik München",
        "dauerhafte Haarentfernung",
        "Epilasyon München",
        "Beauty Studio München",
      ],
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`scroll-smooth ${playfairDisplay.variable} ${manrope.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <LocalBusinessSchema />
      </head>
      <body className="bg-surface text-on-surface font-body-md overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          <BookingModalProvider>
            {children}
            <BookingModal />
          </BookingModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
