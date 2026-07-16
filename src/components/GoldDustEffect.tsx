'use client';
import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: string;
  tw: number;
};

const COLORS = ['#ffe089', '#eac243', '#c5a021', '#fff6de'];
const MAX_PARTICLES = 220;

/**
 * Mouse-follow gold dust trail, layered over the first hero slide only.
 * Purely decorative (no CTA/metric purpose) — see strategy discussion.
 * Skips itself on touch-only devices and prefers-reduced-motion.
 */
export default function GoldDustEffect({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (reduceMotion || !hasFinePointer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = parent!.clientWidth;
      h = parent!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    let mx = w / 2;
    let my = h / 2;
    let px = mx;
    let py = my;
    let hasMouse = false;

    function onMove(e: PointerEvent) {
      const r = parent!.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      hasMouse = true;
    }
    function onLeave() {
      hasMouse = false;
    }
    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerleave', onLeave);

    const particles: Particle[] = [];

    function spawn(x: number, y: number) {
      if (particles.length > MAX_PARTICLES) particles.splice(0, particles.length - MAX_PARTICLES);
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 0.6 + 0.15;
      particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.15,
        life: 1,
        decay: Math.random() * 0.012 + 0.006,
        size: Math.random() * 2.2 + 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        tw: Math.random() * Math.PI * 2,
      });
    }

    let raf = 0;
    function frame() {
      ctx!.clearRect(0, 0, w, h);

      px += (mx - px) * 0.18;
      py += (my - py) * 0.18;
      if (hasMouse) {
        spawn(px, py);
        spawn(px, py);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.001;
        p.life -= p.decay;
        p.tw += 0.15;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const flicker = 0.55 + Math.sin(p.tw) * 0.45;
        const alpha = Math.max(p.life, 0) * flicker;
        const size = p.size * (0.5 + p.life * 0.7);

        const grad = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 4);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx!.fillStyle = grad;
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, size * 4, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', onLeave);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'screen', zIndex: 15 }}
      aria-hidden="true"
    />
  );
}
