"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle() {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        r: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.5,
        life: 0,
        maxLife: 200 + Math.random() * 300,
      };
    }

    // Initial particles
    const maxParticles = 100;
    for (let i = 0; i < maxParticles; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife; // stagger initial positions
      particles.push(p);
    }

    function animate() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const isLight = document.documentElement.classList.contains("light");
      const color = isLight ? "100, 70, 40" : "212, 168, 84";
      const particleBaseAlpha = isLight ? 1.5 : 0.5;
      const lineBaseAlpha = isLight ? 0.35 : 0.06;
      const lineDist = isLight ? 160 : 120;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          particles[i] = spawnParticle();
          continue;
        }

        const lifeRatio = 1 - Math.abs(p.life / p.maxLife - 0.5) * 2;
        const alpha = p.opacity * particleBaseAlpha * lifeRatio;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color}, ${alpha})`;
        ctx!.fill();

        // Draw connection lines between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < lineDist) {
            const lineAlpha = (1 - dist / lineDist) * lineBaseAlpha * lifeRatio;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.strokeStyle = `rgba(${color}, ${lineAlpha})`;
            ctx!.lineWidth = isLight ? 0.8 : 0.5;
            ctx!.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
