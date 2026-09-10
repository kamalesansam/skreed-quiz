'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { onBurst } from '@/lib/burst';

type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; color: string };

/**
 * Pigment burst. A fixed canvas that spawns beads with gravity and drag from a screen point.
 * Kept outside React state; one requestAnimationFrame loop that sleeps when idle.
 */
export function BurstLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles: P[] = [];
    let raf = 0;
    let running = false;
    let last = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles = particles.filter((p) => p.life < p.max);
      for (const p of particles) {
        p.life += dt;
        p.vy += 1400 * dt; // gravity
        p.vx *= 1 - 1.6 * dt; // drag
        p.vy *= 1 - 0.4 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const k = 1 - p.life / p.max;
        ctx.globalAlpha = Math.min(1, k * 1.4);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (0.6 + 0.4 * k), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (particles.length > 0) raf = requestAnimationFrame(tick);
      else running = false;
    };

    const off = onBurst(({ x, y, colors, count = 26, power = 1 }) => {
      if (reduce) return;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (380 + Math.random() * 520) * power;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 420 * power,
          r: 3 + Math.random() * 7,
          life: 0,
          max: 0.9 + Math.random() * 0.7,
          color: colors[i % colors.length],
        });
      }
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });

    return () => {
      off();
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 'calc(var(--z-overlay-3d) + 1)' }}
    />
  );
}
