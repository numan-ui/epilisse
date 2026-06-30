import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
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
  openGraph: {
    title: "EPILISSE – Luxury Beauty Care Munich",
    description:
      "Premium Kosmetikstudio in München. Dauerhafte Laser-Haarentfernung, Hydrafacial & Gesichtsästhetik.",
    type: "website",
    locale: "de_DE",
  },
};

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
    <html lang={locale} className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md overflow-x-hidden">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
