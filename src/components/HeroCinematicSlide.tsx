'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import TrustBar from '@/components/TrustBar';

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
/** Scroll the hero holds while the four beats play out. Shortened from an
 *  earlier 13000px (~26 wheel scrolls) — felt exhausting before users reached
 *  the CTA. */
const SCRUB_DISTANCE = 6000;

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
const frameSrc = (i: number) =>
  `/hero-frames/f_${String(i + 1).padStart(3, '0')}.webp`;

/** The master clip has its own baked-in camera push-in/pull-back — measured
 *  by tracking the crown's pixel width (a rigid reference) as a fraction of
 *  the full source frame at 9 sample points across the sequence: it grows
 *  from ~53% (frame 0) to a ~84% peak around frame 149, then eases back to
 *  ~72% by frame 199. That swing is what read as the whole panel "stretching"
 *  while scrubbing — our crop math samples a fixed fraction of the source
 *  every frame, so it just inherits whatever zoom the footage already has.
 *  Keyed by 0-indexed frame; interpolated between points in zoomCorrectionFor. */
const ZOOM_KEYFRAMES: [frame: number, crownRatio: number][] = [
  [0, 0.527],
  [24, 0.605],
  [49, 0.617],
  [74, 0.725],
  [99, 0.723],
  [124, 0.838],
  [149, 0.841],
  [174, 0.792],
  [199, 0.719],
];
// Correcting all the way to either extreme (fully matching the widest or
// the tightest natural moment) turned out to swing too far once the crop's
// own aspect-ratio branching (MIN_DEST_ASPECT / topAnchored) interacted
// with it on narrower panel sizes — frame 0 went from "too wide" to
// "nose-to-hairline crop" on some viewports. So this only nudges toward the
// midpoint, and the nudge itself is capped, instead of fully normalizing —
// bounded, so a viewport quirk can misfire by at most ±12%, not blow up.
const ZOOM_MIDPOINT =
  (Math.min(...ZOOM_KEYFRAMES.map(([, r]) => r)) +
    Math.max(...ZOOM_KEYFRAMES.map(([, r]) => r))) /
  2;
const MAX_CORRECTION_DELTA = 0.12;
/** How much to nudge frame `i`'s crop toward the sequence's midpoint
 *  framing, clamped to a small range so it damps the source's baked-in
 *  push-in/pull-back without ever producing a wild crop on any viewport. */
function zoomCorrectionFor(i: number): number {
  let lo = ZOOM_KEYFRAMES[0];
  let hi = ZOOM_KEYFRAMES[ZOOM_KEYFRAMES.length - 1];
  for (let k = 0; k < ZOOM_KEYFRAMES.length - 1; k++) {
    if (i >= ZOOM_KEYFRAMES[k][0] && i <= ZOOM_KEYFRAMES[k + 1][0]) {
      lo = ZOOM_KEYFRAMES[k];
      hi = ZOOM_KEYFRAMES[k + 1];
      break;
    }
  }
  const [loF, loR] = lo;
  const [hiF, hiR] = hi;
  const t = hiF === loF ? 0 : (i - loF) / (hiF - loF);
  const ratio = loR + (hiR - loR) * t;
  const raw = ratio / ZOOM_MIDPOINT;
  return Math.max(1 - MAX_CORRECTION_DELTA, Math.min(1 + MAX_CORRECTION_DELTA, raw));
}
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

  /** Resolve frame `i` to the nearest already-decoded frame. */
  const resolveLoaded = useCallback((i: number) => {
    const loaded = loadedRef.current;
    const idx = Math.max(0, Math.min(FRAME_COUNT - 1, i));
    if (!loaded[idx]) {
      let lo = idx;
      while (lo >= 0 && !loaded[lo]) lo--;
      if (lo >= 0) return lo;
      let hi = idx;
      while (hi < FRAME_COUNT && !loaded[hi]) hi++;
      if (hi >= FRAME_COUNT) return -1;
      return hi;
    }
    return idx;
  }, []);

  /** Crop-and-paint one already-decoded frame at the given opacity. */
  const paintFrame = useCallback((idx: number, alpha: number) => {
    const canvas = canvasRef.current;
    const img = framesRef.current[idx];
    const ctx = canvas?.getContext('2d');
    if (!canvas || !img || !ctx) return;
    // Crop the source frame to cover the canvas box (object-fit: cover
    // math) so the panel never shows a gap at its edges. On a very
    // narrow/tall panel (a slim window, a portrait monitor) a true cover
    // crop has to zoom in absurdly tight on the face to fill the width —
    // clamp how narrow a "virtual" aspect we'll crop for, so beyond that
    // point we let a thin strip of the panel background show at the bottom
    // instead of zooming in further.
    const MIN_DEST_ASPECT = 0.45;
    // Pull back from a tight cover crop so the figure reads as "seen from a
    // little further away" — headroom for the crown instead of a close-up
    // that fills every edge of the panel.
    const ZOOM_OUT = 0.78;
    const srcAspect = img.naturalWidth / img.naturalHeight;
    const destAspect = canvas.width / canvas.height;
    const cropAspect = Math.max(destAspect, MIN_DEST_ASPECT);
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    const topAnchored = cropAspect > srcAspect;
    if (topAnchored) {
      // Anchor to the top of the source frame — the face sits in the upper
      // third, so a centered crop clipped the forehead on short/wide panels.
      sh = sw / cropAspect;
    } else {
      sw = sh * cropAspect;
    }
    // Sample a larger area at the same aspect ratio (zoom out) — still
    // fills the canvas with no distortion, just shows more of the frame.
    // zoomCorrection crops the WIDE frames further in to match the
    // sequence's tightest natural moment (see ZOOM_KEYFRAMES above) — the
    // tight frames are already at the native-resolution clamp, so that's
    // the only direction with pixels to spare.
    const zoomCorrection = zoomCorrectionFor(idx);
    sw = Math.min(img.naturalWidth, (sw / ZOOM_OUT) * zoomCorrection);
    sh = Math.min(img.naturalHeight, (sh / ZOOM_OUT) * zoomCorrection);
    sx = (img.naturalWidth - sw) / 2;
    sy = topAnchored ? 0 : (img.naturalHeight - sh) / 2;
    // Draw at the clamped aspect, full canvas width, anchored to the top —
    // when destAspect < MIN_DEST_ASPECT this leaves a small gap at the
    // bottom rather than over-zooming.
    const dh = Math.min(canvas.height, canvas.width / cropAspect);
    // Nudge the whole image down a bit when top-anchored — the sticky nav
    // bar sits over the panel's own top edge, so a true row-0 anchor put
    // the crown/forehead right behind it. The overflow past the bottom
    // just gets clipped by the canvas, same as before.
    const dy = topAnchored ? canvas.height * 0.1 : 0;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, sw, sh, 0, dy, canvas.width, dh);
    ctx.globalAlpha = 1;
  }, []);

  /** Paint scrub position `i` (may be fractional — rounded to the nearest
   *  decoded frame). A cross-fade between adjacent frames was tried here to
   *  soften the 10fps source's flip-book stepping, but it double-exposed
   *  two frames at slightly different crops whenever the correction above
   *  differed between them — read as the figure's shoulders pulsing wider
   *  and narrower. Reverted; plain single-frame draw has no such artifact. */
  const draw = useCallback((i: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, i));
    const idx = resolveLoaded(Math.round(clamped));
    if (idx < 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintFrame(idx, 1);
    curFrameRef.current = clamped;
    canvas.dataset.frame = String(Math.round(clamped)); // observable scrub position (e2e)
  }, [resolveLoaded, paintFrame]);

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
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      // Skip redundant same-size resizes — clearing/redrawing an
      // already-correct backing store on every sub-pixel ResizeObserver
      // tick is what read as a visible stretch/jitter.
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      canvas.width = w;
      canvas.height = h;
      draw(curFrameRef.current);
    };
    // Deferred one frame: measuring synchronously on mount can catch the
    // box mid-layout (before fonts/CMS content settle it to final size),
    // so the very first backing-store size is already stale and gets
    // visibly stretched to the box's real size once ResizeObserver corrects
    // it a tick later.
    const raf = requestAnimationFrame(resize);
    window.addEventListener('resize', resize);
    // A window resize event alone misses layout-driven size changes (fonts
    // settling, CMS content loading) — the CSS box (h-full/w-full) grows
    // to its final size while the canvas backing store stays at whatever
    // it measured first, so the browser stretches the stale bitmap until
    // the next real resize fires. ResizeObserver catches that directly.
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      ro.disconnect();
    };
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

      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: `+=${SCRUB_DISTANCE}`,
        // scrub: true (not a lag value) tracks the scrollbar 1:1 — a
        // smoothed value re-animates from 0 on every reload/refresh
        // (scroll restored mid-page, timeline still starts at f:0), which
        // read as the scene "playing itself" for ~0.7s after F5.
        scrub: true,
        pin: section,
        // anticipatePin speculatively draws a "how far we'll likely be
        // pinned" frame before the real layout/scroll measurement lands,
        // then the actual refresh corrects it — on reload that showed up
        // as the scene flashing an advanced frame, then snapping back to
        // the opening pose ~100ms later.
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          draw(self.progress * (FRAME_COUNT - 1));
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
        onRefresh: (self) => {
          // Paint the frame for wherever the restored scroll position
          // lands, instead of leaving the stale frame 0 up until the next
          // scroll tick.
          draw(self.progress * (FRAME_COUNT - 1));
        },
      });
      draw(st.progress * (FRAME_COUNT - 1));
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
      <div className="relative flex flex-col justify-center px-margin-desktop pt-36 pb-10 [@media(max-height:800px)]:pt-28 [@media(max-height:800px)]:pb-6">
        {/* Fixed min-height reserves room for the longest headline (2 lines)
            so a shorter one-line beat doesn't shrink this block and shift
            the CTA/trust cards below it up. Shrinks on short viewports
            (laptop screens) so the trust cards don't get clipped by the
            pinned section's fixed 100vh height. */}
        <div className="grid max-w-lg min-h-[150px] md:min-h-[165px] xl:min-h-[195px] mt-4 [@media(max-height:800px)]:mt-0">
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
          className="mt-8 w-fit bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest lux-shadow hover:bg-primary-container transition-colors rounded-[var(--radius-cta)]"
        >
          {cta}
        </motion.button>

        {/* Real-ratings trust bar — static (no per-beat mount) so it can't
            trigger the column jump the CTA fade guards against. */}
        <TrustBar className="mt-6" scope="hero" />

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

      {/* Right — the scrubbed frame sequence, cropped to fully cover the
          panel (no letterboxing gap at the edges — the panel gradient never
          shows through). The poster still sits underneath until the first
          frame decodes (and stays put for reduced motion / when the
          sequence never loads). */}
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- transient decorative poster, swapped out once the canvas paints */}
        <img
          src={POSTER_SRC}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${
            firstReady ? 'opacity-0' : 'opacity-100'
          }`}
          // Same top-anchor + down-nudge as the canvas's own crop (see
          // draw()'s `dy`) — without this the poster showed a tighter crop
          // with the crown hidden behind the sticky nav, then visibly
          // jumped once the canvas took over with the corrected crop.
          style={{ transform: 'translateY(10%)' }}
        />
        <canvas
          ref={canvasRef}
          data-testid="hero-scrub-canvas"
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            firstReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Softens the hard vertical seam where the photo meets the left
            panel's flat gradient — same top/bottom colors as that gradient,
            faded out left-to-right so the two sides melt together instead
            of cutting on the 52/48 column line. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-32 xl:w-40"
          style={{
            background:
              'linear-gradient(180deg,var(--hero-panel-top) 0%,var(--hero-panel-bottom) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black, transparent)',
            maskImage: 'linear-gradient(to right, black, transparent)',
          }}
        />
      </div>
    </div>
  );
}
