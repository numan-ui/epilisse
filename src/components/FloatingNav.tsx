'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useAdminLandingContent } from '@/hooks/useAdminLandingContent';

/**
 * Floating bottom pill nav — appears once the visitor has scrolled past the
 * hero, lets them jump straight to any section/page without scrolling back
 * up to the fixed top nav. Same destinations as the top nav; Kontakt always
 * points at the homepage's contact section since no other page has one.
 */
export default function FloatingNav() {
  const t = useTranslations();
  const lc = useAdminLandingContent();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Stays hidden through the page and only appears once the visitor
    // scrolls down to the FAQ (#faq) section — hides again if they scroll
    // back up above it. Other pages have no #faq section, so fall back to
    // the footer as the same "reached the end" marker.
    const target = document.getElementById('faq') || document.querySelector('footer');
    const onScroll = () => {
      setVisible(target ? target.getBoundingClientRect().top <= window.innerHeight * 0.5 : false);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { href: '/', label: t('nav.home'), icon: 'home' },
    { href: '/behandlungen', label: lc.navBehandlungen || t('nav.behandlungen'), icon: 'spa' },
    { href: '/preise', label: lc.navPreise || t('nav.preise'), icon: 'sell' },
    { href: '/aktionen', label: lc.navAktionen || t('nav.aktionen'), icon: 'local_offer' },
    { href: '/ueber-uns', label: lc.navUeberUns || t('nav.ueberUns'), icon: 'groups' },
    { href: '/#kontakt', label: lc.navKontakt || t('nav.kontakt'), icon: 'call' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          aria-label="Schnellnavigation"
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 sm:gap-1 max-w-[calc(100vw-1.5rem)] overflow-x-auto bg-surface/95 backdrop-blur-md border border-outline-variant/40 rounded-full p-1 sm:p-1.5 lux-shadow"
        >
          {items.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center rounded-full transition-all duration-300 ${
                  active
                    ? 'gap-1.5 sm:gap-2 bg-on-surface text-surface px-2.5 py-2 sm:px-4 sm:py-2.5'
                    : 'flex-col gap-0.5 px-2 py-1.5 sm:px-3 sm:py-2 text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined ${active ? 'text-[18px] sm:text-[20px]' : 'text-[17px] sm:text-[19px]'}`}>
                  {item.icon}
                </span>
                <span
                  className={`font-label-caps tracking-wide whitespace-nowrap ${
                    active ? 'text-[11px] sm:text-[12px]' : 'text-[9px] sm:text-[10px]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
