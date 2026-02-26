/**
 * Non-blocking celebration animation overlay shown when all tasks are completed.
 * Uses CSS keyframe confetti burst. Auto-dismisses after ~2 seconds.
 */

import React, { useEffect, useRef } from 'react';

interface CelebrationAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const CONFETTI_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a78bfa', // purple
  '#fbbf24', // amber
  '#34d399', // emerald
  '#f472b6', // pink
  '#60a5fa', // blue
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

export default function CelebrationAnimation({ show, onComplete }: CelebrationAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!show) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const count = 120;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 14,
      vy: -(Math.random() * 12 + 4),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));

    startTimeRef.current = performance.now();

    const DURATION = 2000; // ms

    function draw(now: number) {
      if (!ctx || !canvas) return;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - progress * 1.2);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onComplete();
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div
        className="relative z-10 flex flex-col items-center gap-3 animate-scale-in"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          🎉
        </div>
        <div className="text-center px-6 py-3 rounded-2xl shadow-xl"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}>
          <p className="text-lg font-bold text-indigo-700">All tasks complete!</p>
          <p className="text-sm text-indigo-500 mt-0.5">Amazing work today 🌟</p>
        </div>
      </div>
    </div>
  );
}
