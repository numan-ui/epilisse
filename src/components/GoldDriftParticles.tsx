'use client';

import { useEffect, useRef } from 'react';

/**
 * A few gold droplets that carry the hero video's gold spray down into the
 * section below it — one scroll-driven pass, then gone:
 *
 *  1. Gather — the droplets fall out of the hero's bottom edge and close in on
 *     the section title.
 *  2. Pass — as they arrive, a single thin band of light sweeps once across
 *     the title's letters.
 *  3. Scatter — they part outward from the title and dissolve. Nothing lingers
 *     over the cards or in the margins.
 *
 * Drop it inside a `relative` section as the first child, and mark the title
 * with `data-gold-title`. Purely decorative: no pointer events, hidden from
 * assistive tech. Desktop only and off under reduced motion — the title then
 * keeps its own plain colour (the sweep styles are only applied from here).
 *
 * Positions come from live bounding rects, not a ScrollTrigger — the hero's
 * pin spacer appears and disappears as the story slider moves, which would
 * leave a cached start/end stale.
 */
type Particle = {
  /** Where it leaves the hero: % of the section width. */
  spawnX: number;
  /** Where it meets the title: direction from the title's centre, and how far
   *  beyond the title's own half-width / half-height (px). */
  angle: number;
  padX: number;
  padY: number;
  /** Sideways bow of the approach path (px). */
  arc: number;
  /** How far it parts from the title before it has dissolved (px). */
  reach: number;
  /** Stagger (0–1) so the group doesn't move as one rigid block. */
  delay: number;
  size: number;
  alpha: number;
  /** Elongated droplet instead of a round bead. */
  drop: boolean;
};

const COUNT = 7;
const DESKTOP_QUERY = '(min-width: 1024px)';

/** Deterministic (same on server and client) so the markup hydrates cleanly. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLES: Particle[] = (() => {
  const rnd = mulberry32(20261005);
  const between = (lo: number, hi: number) => lo + rnd() * (hi - lo);
  return Array.from({ length: COUNT }, (_, i) => {
    // Alternate sides, and keep to a shallow fan left/right of the title so
    // the scatter heads sideways and up — never down into the cards.
    const right = i % 2 === 0;
    const tilt = between(-0.75, 0.3); // radians off horizontal; negative = upward
    return {
      // The figure (and its gold) sits in the right half of the hero.
      spawnX: between(42, 96),
      angle: right ? tilt : Math.PI - tilt,
      padX: between(22, 120),
      padY: between(10, 46),
      arc: between(-90, 90),
      reach: between(160, 380),
      delay: rnd(),
      size: between(3, 8),
      alpha: between(0.75, 1),
      drop: rnd() < 0.4,
    };
  });
})();

/** How far above the section the layer reaches, so the droplets first show
 *  over the hero's bottom edge instead of popping in below it. */
const OVERHANG = 140;
/** The acts, keyed to the title's centre as a fraction of the viewport height
 *  (1 = bottom edge, 0 = top edge). */
const GATHER_FROM = 1.06;
const GATHER_TO = 0.6;
const SCATTER_FROM = 0.52;
const SCATTER_TO = 0.14;
const SWEEP_FROM = 0.8;
const SWEEP_TO = 0.44;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (v: number) => v * v * (3 - 2 * v);
const easeOut = (v: number) => 1 - (1 - v) ** 3;
/** Per-particle slice of a 0–1 act, offset by its stagger. */
const staggered = (act: number, delay: number, spread: number) =>
  clamp01((act - delay * spread) / (1 - spread));

const GOLD = 'radial-gradient(circle at 35% 30%, #fff6de 0%, #ffe089 28%, #eac243 62%, #c5a021 100%)';

/** Title sweep: one narrow band of light over the title's own colour, clipped
 *  to the letters. */
const TITLE_BACKGROUND = [
  'linear-gradient(105deg, rgba(255, 232, 160, 0) calc(var(--gold-x, 0px) - 80px), rgba(255, 232, 160, var(--gold-a, 0)) var(--gold-x, 0px), rgba(255, 232, 160, 0) calc(var(--gold-x, 0px) + 80px))',
  'linear-gradient(var(--gold-title-color), var(--gold-title-color))',
].join(', ');

export default function GoldDriftParticles() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.parentElement;
    if (!layer || !section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Desktop only, like the hero scrub it continues — phones show a still
    // hero with no gold spray, so there is nothing for these to carry on.
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const dots = Array.from(layer.children) as HTMLElement[];
    const title = section.querySelector<HTMLElement>('[data-gold-title]');
    if (!title) return;

    // The title's letters take the sweep through background-clip, so its own
    // colour has to move into the gradient stack.
    let titleW = 0;
    let titleH = 0;
    const measureTitle = () => {
      const range = document.createRange();
      range.selectNodeContents(title);
      const r = range.getBoundingClientRect();
      titleW = r.width;
      titleH = r.height;
    };
    const savedTitleStyle = title.getAttribute('style');
    title.style.setProperty('--gold-title-color', getComputedStyle(title).color);
    title.style.backgroundImage = TITLE_BACKGROUND;
    title.style.backgroundClip = 'text';
    title.style.setProperty('-webkit-background-clip', 'text');
    title.style.color = 'transparent';
    measureTitle();

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      const vh = window.innerHeight;
      // Title centre, in section coordinates and as a viewport fraction.
      const cx = tr.left + tr.width / 2 - rect.left;
      const cy = tr.top + tr.height / 2 - rect.top;
      const u = (tr.top + tr.height / 2) / vh;

      const gather = clamp01((GATHER_FROM - u) / (GATHER_FROM - GATHER_TO));
      const scatter = clamp01((SCATTER_FROM - u) / (SCATTER_FROM - SCATTER_TO));
      layer.style.opacity = gather > 0 && scatter < 1 ? '1' : '0';

      for (let i = 0; i < dots.length; i++) {
        const p = PARTICLES[i];
        const g = easeInOut(staggered(gather, p.delay, 0.3));
        const s = staggered(scatter, p.delay, 0.25);
        const dirX = Math.cos(p.angle);
        const dirY = Math.sin(p.angle);

        // Where it meets the title.
        const meetX = cx + dirX * (titleW / 2 + p.padX);
        const meetY = cy + dirY * (titleH / 2 + p.padY);
        // From the hero's bottom edge, on a bowed path.
        const spawnX = (p.spawnX / 100) * rect.width;
        const spawnY = -OVERHANG * 0.7;
        const bow = Math.sin(Math.PI * g) * p.arc;
        // Then on outward along the same direction, easing to a stop.
        const out = easeOut(s) * p.reach;
        const x = spawnX + (meetX - spawnX) * g + bow + dirX * out;
        const y = spawnY + (meetY - spawnY) * g + dirY * out;

        const el = dots[i];
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${(y + OVERHANG).toFixed(1)}px, 0)`;
        el.style.opacity = (p.alpha * clamp01(g * 3) * (1 - s * s)).toFixed(3);
      }

      // One pass of light, left to right across the letters, as they arrive.
      const sweep = clamp01((SWEEP_FROM - u) / (SWEEP_FROM - SWEEP_TO));
      const textLeft = (tr.width - titleW) / 2;
      title.style.setProperty('--gold-x', `${(textLeft + (-0.15 + 1.3 * sweep) * titleW).toFixed(1)}px`);
      title.style.setProperty('--gold-a', (Math.sin(Math.PI * sweep) * 0.9).toFixed(3));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measureTitle();
      schedule();
    };

    update();
    document.fonts?.ready.then(remeasure).catch(() => {});
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      if (savedTitleStyle === null) title.removeAttribute('style');
      else title.setAttribute('style', savedTitleStyle);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      data-testid="gold-drift"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden overflow-hidden opacity-0 lg:block motion-reduce:hidden"
      style={{ top: -OVERHANG }}
    >
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute left-0 top-0 block will-change-transform"
          style={{
            opacity: 0,
            width: p.size,
            height: p.drop ? p.size * 1.45 : p.size,
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            background: GOLD,
            borderRadius: p.drop ? '50% 50% 50% 50% / 62% 62% 38% 38%' : '50%',
            boxShadow: `0 0 ${p.size * 1.4}px ${p.size * 0.3}px rgba(234, 194, 67, 0.45)`,
          }}
        />
      ))}
    </div>
  );
}
