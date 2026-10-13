"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { useAdminLandingContent } from "@/hooks/useAdminLandingContent";
import { useBookingModal } from "@/context/BookingModalContext";
import ContactBackdrop from "@/components/ContactBackdrop";

/**
 * "Kontakt & Standort" block — photo backdrop, three glass cards (address /
 * hours / phone) and the booking, WhatsApp and Maps buttons. Shared by the
 * homepage section and the /kontakt page so the two can never drift apart.
 * `variant="page"` makes it that page's header: <h1> plus room for the fixed navbar.
 */
export default function ContactSection({ variant = "section" }: { variant?: "section" | "page" }) {
  const t = useTranslations();
  const settings = useAdminSettings();
  const lc = useAdminLandingContent();
  const booking = useBookingModal();
  const isPage = variant === "page";
  const Heading = isPage ? "h1" : "h2";

  /* ── Dynamic booking URLs from admin settings ─── */
  const waRaw    = settings.whatsapp.replace(/[\s+\-()]/g, '');
  const WA_URL   = waRaw
    ? `https://wa.me/${waRaw}?text=${encodeURIComponent(settings.whatsappMsg)}`
    : 'https://wa.me/4989XXXXXXXX';
  const MAPS_URL = settings.address
    ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}`
    : 'https://maps.google.com/?q=München';

  /* ── Contact display values: admin settings override i18n placeholders ─── */
  const displayAddress = settings.address || t("contact.address");
  const hourRows       = settings.hours.map(d => ({
    day: d.day,
    time: d.closed ? 'Geschlossen' : `${d.open} – ${d.close} Uhr`,
  }));
  const displayPhone   = settings.phone || t("contact.phone");
  const phoneHref      = displayPhone.replace(/\s/g, '');
  // settings.hours runs Monday → Sunday. Client-only (visitor's clock) to avoid a hydration mismatch.
  const [todayIdx, setTodayIdx] = useState<number | null>(null);
  useEffect(() => setTodayIdx((new Date().getDay() + 6) % 7), []);

  return (
  <section id="kontakt" className="relative isolate overflow-hidden">
    <ContactBackdrop src="/images/contact-bg.webp" />
    <div className={`${isPage ? "pt-36 pb-section-gap" : "py-section-gap"} px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto`}>
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col items-center mb-12"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-inverse-primary" />
        <span className="font-label-caps text-label-caps text-inverse-primary tracking-[0.2em]">
          {lc.contactSectionLabel || t("contact.sectionLabel")}
        </span>
        <span className="w-16 h-[2px] bg-inverse-primary" />
      </div>
      <Heading className="font-display-lg text-headline-lg font-semibold text-white text-center">
        {lc.contactTitle || t("contact.title")}
      </Heading>
    </motion.div>

    {/* Three glass cards: slim address + phone flank the taller hours card */}
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-[1180px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.3fr_1fr] gap-6 md:gap-8 items-center"
    >

      {/* Address card */}
      <div className="glass-panel p-8 flex flex-col gap-4">
        <div className="glass-chip w-11 h-11 flex items-center justify-center">
          <span className="material-symbols-outlined text-inverse-primary">location_on</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm font-medium text-white">
          {lc.contactAddressTitle || t("contact.addressTitle")}
        </h3>
        <address className="font-body-sm text-body-sm text-white/85 not-italic whitespace-pre-line">
          {displayAddress}
        </address>
      </div>

      {/* Hours card — the centrepiece */}
      <div className="glass-panel glass-panel-lead p-8 md:p-10 flex flex-col gap-5 order-first md:order-none">
        <div className="flex items-center gap-4">
          <div className="glass-chip w-11 h-11 flex items-center justify-center">
            <span className="material-symbols-outlined text-inverse-primary">schedule</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-medium text-white">
            {lc.contactHoursTitle || t("contact.hoursTitle")}
          </h3>
        </div>
        <ul className="flex flex-col divide-y divide-white/10 font-body-sm text-body-sm tabular-nums">
          {hourRows.map((row, i) => {
            const isToday = i === todayIdx;
            return (
              <li
                key={i}
                className={`flex items-center justify-between gap-6 py-2.5 ${isToday ? "text-white font-medium" : "text-white/75"}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-inverse-primary" : "bg-transparent"}`} />
                  {row.day}
                </span>
                {row.time && <span className={isToday ? "text-inverse-primary" : ""}>{row.time}</span>}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Phone card */}
      <div className="glass-panel p-8 flex flex-col gap-4">
        <div className="glass-chip w-11 h-11 flex items-center justify-center">
          <span className="material-symbols-outlined text-inverse-primary">phone</span>
        </div>
        <h3 className="font-headline-sm text-headline-sm font-medium text-white">
          {lc.contactPhoneTitle || t("contact.phoneTitle")}
        </h3>
        <a
          href={`tel:${phoneHref}`}
          className="font-body-sm text-body-sm text-white/85 hover:text-inverse-primary transition-colors tabular-nums"
        >
          {displayPhone}
        </a>
      </div>
    </motion.div>

    {/* CTA buttons row */}
    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
      <button
        type="button"
        onClick={() => booking.open()}
        className="bg-cta text-on-cta px-6 py-3 font-label-caps text-label-caps tracking-widest hover:bg-cta-hover transition-all scale-100 hover:scale-105 duration-200 text-center rounded-[var(--radius-cta)]"
      >
        {t("contact.ctaCalendar")}
      </button>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-btn flex items-center justify-center gap-2 text-white px-6 py-3 font-label-caps text-label-caps tracking-widest scale-100 hover:scale-105 duration-200 rounded-[var(--radius-cta)]"
      >
        <span className="material-symbols-outlined text-sm">chat</span>
        {t("contact.ctaWhatsapp")}
      </a>
      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-btn flex items-center justify-center gap-2 text-white px-6 py-3 font-label-caps text-label-caps tracking-widest scale-100 hover:scale-105 duration-200 rounded-[var(--radius-cta)]"
      >
        <span className="material-symbols-outlined text-sm">map</span>
        {t("contact.ctaMaps")}
      </a>
    </div>
    </div>
  </section>
  );
}
