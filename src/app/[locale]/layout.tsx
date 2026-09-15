import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BookingModalProvider } from "@/context/BookingModalContext";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { PageContentProvider } from "@/context/PageContentContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { Suspense } from "react";
import BookingModal from "@/components/BookingModal";
import BookingModalFromUrl from "@/components/BookingModalFromUrl";
import LocalBusinessSchema from "@/components/LocalBusinessSchema";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_URL, buildMetadata } from "@/lib/seo";
import { getServerCategories } from "@/lib/content/categories";
import { getServerPageContent } from "@/lib/content/pageContent";
import { getServerSiteContent } from "@/lib/content/site";
import { getServerFaqChatState } from "@/lib/content/faqChat";
import FaqChatWidget from "@/components/FaqChatWidget";
import { INIT_FAQ_CHAT_CONTENT } from "@/lib/content/faqChatTypes";
import { getServerTheme } from "@/lib/theme/server";
import { deriveTokens } from "@/lib/theme/derive";
import { themeVarsToCss } from "@/lib/theme/css";
import { GOLD_LUX, sameTheme } from "@/lib/theme/presets";
import "../globals.css";

/* display: "block" — "optional" and "swap" were both tried and rejected (see memory:
   project_text_shrink_unresolved_2026-07-16). Root cause: "optional" lets each page load
   independently decide fallback-vs-real-font, and Playfair Display's fallback face doesn't
   visually match its metrics closely — so consecutive refreshes could alternate between two
   different-looking renders, read by the user as text "shrinking" on refresh. "block" removes
   the fallback path entirely (brief invisible text, then the real font, every load) so there's
   only ever one appearance. Self-hosted fonts (next/font downloads at build time), so the
   invisible window is a few hundred ms at most. */
/* Only "normal" style and only the weights actually used anywhere in the app (verified via
   grep for `italic` and `font-light` — neither is used) — every extra weight/style is a
   separate font file the browser has to fetch before it can stop showing the fallback, which
   widens the visible-swap window on slow connections. */
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal"],
  variable: "--font-playfair-display",
  display: "block",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "block",
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

  // All independent — run concurrently instead of one sequential await chain.
  // Was: messages, then theme, then this Promise.all, each waiting on the
  // last for no reason. The body (LCP image included) can't stream to the
  // browser until every one of these resolves, so the waterfall directly
  // padded PageSpeed's "resource load delay".
  const [messages, theme, categories, pageContent, siteContent, faqChatState] =
    await Promise.all([
      getMessages(),
      getServerTheme(),
      getServerCategories(),
      getServerPageContent(),
      getServerSiteContent(),
      getServerFaqChatState(),
    ]);

  // Site theme. While the saved theme matches the Gold Lux preset the site
  // renders straight from globals.css @theme; only a customised theme injects
  // an override block (html:root, so it beats @theme's :root regardless of
  // stylesheet order).
  const themeCss = sameTheme(theme, GOLD_LUX)
    ? null
    : themeVarsToCss(deriveTokens(theme).vars);
  const faqChatContent = faqChatState.content;

  return (
    <html
      lang={locale}
      className={`${playfairDisplay.variable} ${manrope.variable}`}
    >
      <head>
        {themeCss && (
          <style
            id="theme-vars"
            dangerouslySetInnerHTML={{ __html: themeCss }}
          />
        )}
        {/* Material Symbols is now self-hosted (see globals.css) — no more
            fonts.googleapis.com/fonts.gstatic.com round trips. Preload since
            it's used above the fold (nav icons) on every page. */}
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <LocalBusinessSchema />
      </head>
      <body className="bg-surface text-on-surface font-body-md overflow-x-hidden">
        <SmoothScroll />
        <NextIntlClientProvider messages={messages}>
          <CategoriesProvider value={categories}>
            <PageContentProvider value={pageContent}>
              <SiteContentProvider value={siteContent}>
                <BookingModalProvider>
                  {children}
                  <BookingModal />
                  <Suspense fallback={null}>
                    <BookingModalFromUrl />
                  </Suspense>
                  {faqChatState.enabled && (
                    <FaqChatWidget
                      content={{
                        de: { ...INIT_FAQ_CHAT_CONTENT.de, ...faqChatContent.de },
                        en: { ...INIT_FAQ_CHAT_CONTENT.en, ...faqChatContent.en },
                        tr: { ...INIT_FAQ_CHAT_CONTENT.tr, ...faqChatContent.tr },
                      }}
                      initialLocale={locale === 'en' ? 'en' : 'de'}
                    />
                  )}
                </BookingModalProvider>
              </SiteContentProvider>
            </PageContentProvider>
          </CategoriesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
