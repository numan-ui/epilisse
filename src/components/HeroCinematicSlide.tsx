'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = {
  /** H.264 mp4 (dense-keyframe encode, for frame-accurate scrubbing). */
  src: string;
  /** Still shown before the video decodes / when motion is reduced. */
  poster?: string;
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
    sub: 'Der erste Atemzug. Etwas beginnt sich zu regen.',
    cta: 'hidden' as const,
  },
  {
    line: 'Zum Leben erweckt.',
    sub: 'Aus Stein wird Haut, aus Stille wird Ausdruck.',
    cta: 'hidden' as const,
  },
  {
    line: 'Entfalte deine Schönheit.',
    sub: 'Sichtbar, spürbar – ganz du.',
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
  src,
  poster,
  cta,
  active,
  onCtaClick,
  onDone,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useGSAP(
    () => {
      const root = rootRef.current;
      const video = videoRef.current;
      if (!root || !video || !active) return;

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

      const build = () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: `+=${SCRUB_DISTANCE}`,
              scrub: 1,
              pin: section,
              anticipatePin: 1,
              onUpdate: (self) => {
                const idx = phaseFor(self.progress);
                if (idx !== lastIdx) {
                  lastIdx = idx;
                  setPhase(idx);
                }
                setNearTop(self.progress < 0.03);
                if (self.progress > 0.95) fireDone();
              },
              onLeave: fireDone,
            },
          })
          .fromTo(
            video,
            { currentTime: 0 },
            { currentTime: video.duration || 1, ease: 'none', duration: 1 },
            0,
          );
      };

      if (video.readyState >= 1 && video.duration) {
        build();
      } else {
        video.addEventListener('loadedmetadata', build, { once: true });
        return () => video.removeEventListener('loadedmetadata', build);
      }
    },
    { scope: rootRef, dependencies: [active], revertOnUpdate: true },
  );

  const ctaMode = PHASES[phase].cta;

  return (
    <div
      ref={rootRef}
      data-testid="hero-scrub-video"
      className="absolute inset-0 z-[5] hidden lg:grid lg:grid-cols-[52%_48%]"
    >
      {/* Left — the advancing copy, over a dark panel */}
      <div
        className="relative flex flex-col justify-center px-margin-desktop py-28"
        style={{ background: 'linear-gradient(135deg,#3a3226 0%,#161310 100%)' }}
      >
        <AnimatePresence mode="wait">
          <motion.h1
            key={phase}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-display-lg text-[36px] md:text-[42px] xl:text-[52px] font-bold leading-[1.1] tracking-[-0.015em] text-white max-w-lg"
          >
            {PHASES[phase].line}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={phase}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 0.85, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="mt-5 font-body-lg text-body-md text-white/80 max-w-md"
          >
            {PHASES[phase].sub}
          </motion.p>
        </AnimatePresence>

        <motion.p
          animate={{ opacity: phase === PHASES.length - 1 ? 0.7 : 0.4 }}
          transition={{ duration: 0.6 }}
          className="mt-3 font-body-lg text-body-sm text-white/60"
        >
          {BRAND_LINE}
        </motion.p>

        {ctaMode !== 'hidden' && (
          <motion.button
            type="button"
            onClick={onCtaClick}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: ctaMode === 'full' ? 1 : 0.75, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-10 w-fit bg-primary text-on-primary px-10 py-5 font-label-caps text-label-caps tracking-widest lux-shadow hover:bg-primary-container transition-colors"
          >
            {cta}
          </motion.button>
        )}

      </div>

      {/* Scroll hint — centred on the seam; fades out after the first nudge */}
      <AnimatePresence>
        {nearTop && motionOk && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pointer-events-none absolute bottom-9 left-[52%] z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-center"
          >
            <span className="font-label-caps text-[12px] font-semibold tracking-[0.24em] text-white">
              SCROLLEN
            </span>
            <span className="text-[11px] tracking-wide text-white/70">
              Entdecke, was darunter liegt.
            </span>
            <motion.span
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="material-symbols-outlined mt-1 text-[26px] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
            >
              arrow_downward
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right — the scrubbed video */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,#3a3226 0%,#161310 100%)' }}
        />
        <video
          ref={videoRef}
          data-testid="hero-scrub-video-el"
          className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
          style={{ objectPosition: 'center 30%' }}
          poster={poster}
          muted
          playsInline
          preload="auto"
        >
          <source src={src} type="video/mp4" />
        </video>

        {/* Soften the seam into the left panel. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-40"
          style={{
            background:
              'linear-gradient(90deg,#161310 0%,rgba(22,19,16,0.6) 35%,rgba(22,19,16,0) 100%)',
          }}
        />

      </div>
    </div>
  );
}
