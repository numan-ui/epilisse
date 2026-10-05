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
let activeLenis: Lenis | null = null;

/** Jump the page to `y` with no easing. Goes through Lenis when it's running
 *  — a bare window.scrollTo would be eased back by Lenis' own rAF loop, which
 *  still holds the old target. */
export function jumpScrollTo(y: number) {
  if (activeLenis) activeLenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

/** True while Lenis is still easing toward its scroll target. */
export function isSmoothScrolling() {
  return !!activeLenis?.isScrolling;
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // The browser restores scroll position natively on reload, but that
    // restore lands after this effect mounts and Lenis has already started
    // rendering from 0 — the native jump then gets smoothed away by Lenis'
    // own easing, which reads as the whole page sliding on refresh. Owning
    // restoration ourselves (instant, before Lenis's first frame) removes
    // the fight between the two.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      // expo-out: quick pickup, long gentle settle
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    activeLenis = lenis;

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
      activeLenis = null;
      lenis.destroy();
    };
  }, []);

  return null;
}
