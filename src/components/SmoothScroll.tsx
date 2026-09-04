'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Site-wide smoothed scrolling. Lenis eases the raw wheel/trackpad deltas and
 * drives GSAP's ScrollTrigger from the same rAF loop so the pinned hero scrub
 * stays in lockstep. Disabled entirely under prefers-reduced-motion — there the
 * browser's native (instant) scroll is what the user asked for.
 *
 * The root <html> no longer carries `scroll-smooth`; CSS smooth-scroll and Lenis
 * fight over the same frames, so in-page anchor jumps are routed through
 * `lenis.scrollTo` here instead.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: quick pickup, long gentle settle
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Route same-page anchor clicks through Lenis so they ease instead of
    // snapping (native scrollIntoView gets overridden by Lenis' rAF next frame).
    const onAnchorClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80 });
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return null;
}
