'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  /** CTA label (from the admin hero slide). */
  cta: string;
  /** True while slide 1 is the visible slide. */
  active: boolean;
  onCtaClick: () => void;
  /**
   * Fires once the reveal is finished (scrolled past) or was skipped
   * (mobile / reduced motion). The landing page holds the story-slider
   * auto-advance until then.
   */
  onDone: () => void;
};

const DESKTOP_QUERY = '(min-width: 1024px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
/** Scroll the hero holds while the four beats play out. Tuned to the 20s
 *  master clip at ~650px of scroll per second of footage — deliberate enough
 *  that a single trackpad flick can't blow through the whole reveal. */
const SCRUB_DISTANCE = 13000;

/* ── Frame sequence ──────────────────────────────────────────────────────
   The reveal is a pre-extracted WebP frame sequence drawn to <canvas>,
   indexed by scroll progress — no per-frame `video.currentTime` seek, so no
   decoder stutter. Regenerate on a new master with:
     ffmpeg -i public/videos/beauty-scrub.mp4 \
       -vf "fps=10,scale=640:800:flags=lanczos" \
       -c:v libwebp -quality 56 -compression_level 6 -preset picture \
       public/hero-frames/f_%03d.webp
   (10 fps × 20 s = 200 frames; bump FRAME_COUNT / aspect to match.) */
const FRAME_COUNT = 200;
const FRAME_ASPECT = '640 / 800';
const frameSrc = (i: number) =>
  `/hero-frames/f_${String(i + 1).padStart(3, '0')}.webp`;
/** Static fallback for the loading gap and reduced-motion — frame 0 itself,
 *  so it's never a mismatched photo, just the sequence's own opening beat. */
const POSTER_SRC = frameSrc(0);

/** Copy beats, locked to the video's transformation — statue → awakening →
 *  half-and-half → fully alive. Kept short so they read during a scroll. */
const PHASES = [
  {
    line: 'Schönheit in ihrer reinsten Form.',
    sub: 'Roh, unberührt – und schon vollkommen.',
    cta: 'soft' as const,
  },
  {
    line: 'Schönheit erwacht.',
    sub: 'Ein Moment für dich. Und deine Haut.',
    cta: 'hidden' as const,
  },
  {
    line: 'Zum Leben erweckt.',
    sub: 'Sichtbar frisch. Spürbar gepflegt.',
    cta: 'hidden' as const,
  },
  {
    line: 'Entfalte deine Schönheit.',
    sub: 'Bei EPILISSE in München.',
    cta: 'full' as const,
  },
];
/** Scroll-progress (0–1) at which each beat takes over. */
const PHASE_AT = [0, 0.32, 0.6, 0.86];
/** Brand line that settles in under the last beat. */
const BRAND_LINE = 'Schönheit, die sichtbar wird.';

function phaseFor(progress: number) {
  let idx = 0;
  for (let k = 0; k < PHASE_AT.length; k++) if (progress >= PHASE_AT[k]) idx = k;
  return idx;
}

/**
 * Slide 1's desktop treatment: a split hero. Left — a line of copy that
 * advances through four beats as you scroll. Right — a scroll-scrubbed video
 * of a marble figure coming to life, in lockstep with the copy. The hero pins
 * for ~2000px so the reveal has room, then releases. Rendered only on lg; on
 * phones and for reduced motion it shows the first beat as a still and calls
 * `onDone` straight away.
 */
export default function HeroCinematicSlide({
  cta,
  active,
  onCtaClick,
  onDone,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const curFrameRef = useRef(0);
  const [firstReady, setFirstReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [nearTop, setNearTop] = useState(true); // scroll hint shows only at the very start
  const [motionOk, setMotionOk] = useState(true);

  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const doneFiredRef = useRef(false);
  const fireDone = useCallback(() => {
    if (doneFiredRef.current) return;
    doneFiredRef.current = true;
    doneRef.current();
  }, []);

  useEffect(() => {
    const check = () =>
      setMotionOk(!window.matchMedia(REDUCED_MOTION_QUERY).matches);
    check();
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    mq.addEventListener('change', check);
    return () => mq.removeEventListener('change', check);
  }, []);

  /** Paint frame `i` (or the nearest already-decoded frame) into the canvas. */
  const draw = useCallback((i: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imgs = framesRef.current;
    const loaded = loadedRef.current;

    let idx = Math.max(0, Math.min(FRAME_COUNT - 1, i));
    if (!loaded[idx]) {
      let lo = idx;
      while (lo >= 0 && !loaded[lo]) lo--;
      if (lo >= 0) idx = lo;
      else {
        let hi = idx;
        while (hi < FRAME_COUNT && !loaded[hi]) hi++;
        if (hi >= FRAME_COUNT) return;
        idx = hi;
      }
    }
    const img = imgs[idx];
    const ctx = canvas.getContext('2d');
    if (!img || !ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    curFrameRef.current = idx;
    canvas.dataset.frame = String(idx); // observable scrub position (e2e)
  }, []);

  /* Preload the sequence: frame 0 first (reveals the canvas), then the rest
     through a small concurrency pool so we don't fire 200 requests at once. */
  useEffect(() => {
    if (!active) return;
    if (
      window.matchMedia(REDUCED_MOTION_QUERY).matches ||
      !window.matchMedia(DESKTOP_QUERY).matches
    )
      return;

    const imgs: HTMLImageElement[] = [];
    const loaded = new Array<boolean>(FRAME_COUNT).fill(false);
    framesRef.current = imgs;
    loadedRef.current = loaded;
    let cancelled = false;

    const loadOne = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          loaded[i] = true;
          if (!cancelled && i === 0) {
            setFirstReady(true);
            draw(0);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = frameSrc(i);
        imgs[i] = img;
      });

    (async () => {
      await loadOne(0);
      let next = 1;
      const worker = async () => {
        while (!cancelled && next < FRAME_COUNT) await loadOne(next++);
      };
      await Promise.all(Array.from({ length: 6 }, worker));
    })();

    return () => {
      cancelled = true;
    };
  }, [active, draw]);

  /* Keep the canvas backing store matched to its displayed size (DPR-aware). */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(curFrameRef.current);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [draw, firstReady]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || !active) return;

      // Not eligible → show beat 1 as a still and let the slider proceed.
      if (
        window.matchMedia(REDUCED_MOTION_QUERY).matches ||
        !window.matchMedia(DESKTOP_QUERY).matches
      ) {
        fireDone();
        return;
      }

      const section = root.closest('section') ?? root;
      let lastIdx = -1;
      let lastNearTop = true;
      const proxy = { f: 0 };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${SCRUB_DISTANCE}`,
            // A touch of catch-up lag smooths the frame stepping and eases
            // hard flicks; still responsive enough to feel direct.
            scrub: 1.5,
            pin: section,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = phaseFor(self.progress);
              if (idx !== lastIdx) {
                lastIdx = idx;
                setPhase(idx);
              }
              // Guard the state writes so a scroll tick that changes
              // nothing doesn't push a React render.
              const nt = self.progress < 0.03;
              if (nt !== lastNearTop) {
                lastNearTop = nt;
                setNearTop(nt);
              }
              if (self.progress > 0.95) fireDone();
            },
            onLeave: fireDone,
          },
        })
        .to(proxy, {
          f: FRAME_COUNT - 1,
          ease: 'none',
          duration: 1,
          onUpdate: () => draw(Math.round(proxy.f)),
        });
    },
    { scope: rootRef, dependencies: [active], revertOnUpdate: true },
  );

  const ctaMode = PHASES[phase].cta;

  return (
    <div
      ref={rootRef}
      data-testid="hero-scrub-video"
      className="absolute inset-0 z-[5] hidden lg:grid lg:grid-cols-[52%_48%]"
      style={{
        background:
          'linear-gradient(180deg,var(--hero-panel-top) 0%,var(--hero-panel-bottom) 100%)',
      }}
    >
      {/* Left — the advancing copy. Headline + subline live in ONE keyed
          block, stacked in a single grid cell so the outgoing beat cross-
          fades with the incoming one (they can't desync) and a brief
          focus-pull blur hides sub-pixel jitter at the phase boundary. */}
      <div className="relative flex flex-col justify-center px-margin-desktop py-28">
        <div className="grid max-w-lg">
          <AnimatePresence>
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="[grid-area:1/1]"
            >
              <h1 className="font-display-lg text-[36px] md:text-[42px] xl:text-[52px] font-bold leading-[1.1] tracking-[-0.015em] text-[var(--hero-on-panel)]">
                {PHASES[phase].line}
              </h1>
              <p className="mt-5 font-body-lg text-body-md text-[var(--hero-on-panel-muted)] max-w-md opacity-85">
                {PHASES[phase].sub}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p
          animate={{ opacity: phase === PHASES.length - 1 ? 0.7 : 0.4 }}
          transition={{ duration: 0.6 }}
          className="mt-3 font-body-lg text-body-sm text-[var(--hero-on-panel-dim)]"
        >
          {BRAND_LINE}
        </motion.p>

        {/* CTA stays mounted at every beat and just fades — mounting it only
            on beats 1 & 4 made the whole column jump. */}
        <motion.button
          type="button"
          onClick={onCtaClick}
          animate={{
            opacity: ctaMode === 'full' ? 1 : ctaMode === 'soft' ? 0.72 : 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ pointerEvents: ctaMode === 'hidden' ? 'none' : 'auto' }}
          aria-hidden={ctaMode === 'hidden'}
          className="mt-10 w-fit bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest lux-shadow hover:bg-primary-container transition-colors rounded-[var(--radius-cta)]"
        >
          {cta}
        </motion.button>

      </div>

      {/* Scroll hint — centred on the split line between the copy and the
          video, so it reads as "keep going down". A minimal capsule with a
          travelling bead + a pulsing chevron; the whole group bobs. Fades out
          after the first nudge. */}
      <AnimatePresence>
        {nearTop && motionOk && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pointer-events-none absolute top-[44%] left-[46%] z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-center"
          >
            <span className="font-label-caps text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--hero-on-panel)] drop-shadow-[0_1px_6px_var(--hero-hint-shadow)]">
              Scrollen
            </span>
            <span className="max-w-[18ch] text-[11px] leading-snug tracking-wide text-[var(--hero-on-panel-dim)]">
              Entdecke, was darunter liegt.
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="mt-1 flex flex-col items-center gap-2"
            >
              <div className="relative h-11 w-[22px] overflow-hidden rounded-full border border-[var(--hero-hint-line)]">
                <motion.span
                  className="absolute left-1/2 top-2 block h-[7px] w-[3px] -translate-x-1/2 rounded-full bg-[var(--hero-bead)] shadow-[0_0_8px_2px_var(--hero-bead-glow)]"
                  animate={{ y: [0, 16], opacity: [1, 0.15] }}
                  transition={{ repeat: Infinity, duration: 1.7, ease: 'easeIn' }}
                />
              </div>
              <svg
                width="16"
                height="9"
                viewBox="0 0 16 9"
                fill="none"
                className="text-[var(--hero-bead)]"
                aria-hidden="true"
              >
                <path
                  d="M1 1l7 6 7-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right — the scrubbed frame sequence in a 4:5 box, bottom-aligned. The
          master is 4:5 so the box crops nothing; the equal dark margin above
          and below it reads as a frame, not a gap. The poster still sits
          underneath until the first frame decodes (and stays put for reduced
          motion / when the sequence never loads). */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient decorative poster, swapped out once the canvas paints */}
          <img
            src={POSTER_SRC}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className={`absolute bottom-0 left-1/2 h-full w-auto max-w-full -translate-x-1/2 object-cover object-bottom transition-opacity duration-700 ${
              firstReady ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <canvas
            ref={canvasRef}
            data-testid="hero-scrub-canvas"
            className={`relative h-full w-auto max-w-full transition-opacity duration-700 ${
              firstReady ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ aspectRatio: FRAME_ASPECT }}
          />
        </div>
      </div>
    </div>
  );
}
