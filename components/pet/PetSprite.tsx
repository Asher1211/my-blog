"use client";

import { useEffect, useRef } from "react";

export type PetAnimation = "idle" | "walk" | "chat" | "sleep" | "excited";

interface SpriteConfig {
  src: string;
  frames: number;
  fps: number;
}

const SPRITE_MAP: Partial<Record<PetAnimation, SpriteConfig>> = {
  idle: { src: "/pet/idle.png", frames: 9, fps: 18 },
};

interface Props {
  animation: PetAnimation;
  size?: number;
}

export default function PetSprite({ animation, size = 64 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timerRef = useRef(0);
  const spriteImg = useRef<HTMLImageElement | null>(null);

  // Load sprite sheet
  useEffect(() => {
    const config = SPRITE_MAP[animation];
    if (!config) return;

    const img = new Image();
    img.onload = () => { spriteImg.current = img; };
    img.src = config.src;
  }, [animation]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const config = SPRITE_MAP[animation];
    if (!config) {
      // No sprite config — clear canvas
      ctx.clearRect(0, 0, size, size);
      return;
    }

    const frameCount = config.frames;
    const frameTime = 1000 / config.fps;
    let running = true;
    let lastFrame = 0;
    frameRef.current = 0;

    function loop(time: number) {
      if (!running) return;

      if (time - lastFrame >= frameTime) {
        frameRef.current = (frameRef.current + 1) % frameCount;
        lastFrame = time;

        ctx!.clearRect(0, 0, size, size);

        const img = spriteImg.current;
        if (img) {
          const fw = img.width / frameCount;
          const sx = frameRef.current * fw;
          ctx!.drawImage(img, sx, 0, fw, img.height, 0, 0, size, size);
        }
      }

      timerRef.current = requestAnimationFrame(loop);
    }

    timerRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(timerRef.current);
    };
  }, [animation, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
}
