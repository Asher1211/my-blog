"use client";

import { useEffect, useRef, useState } from "react";

export type PetAnimation = "idle" | "walk" | "chat";

interface SpriteConfig { src: string; frames: number; fps: number; }

const SPRITE_MAP: Record<PetAnimation, SpriteConfig> = {
  idle: { src: "/pet/idle.png", frames: 22, fps: 12 },
  walk: { src: "/pet/walk.png", frames: 12, fps: 10 },
  chat: { src: "/pet/chat.png", frames: 9, fps: 9 },
};

interface Props { animation: PetAnimation; size?: number; facingLeft?: boolean; }

export default function PetSprite({ animation, size = 64, facingLeft = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const timerRef = useRef(0);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [loaded, setLoaded] = useState(false);

  // Preload ALL sprite images once
  useEffect(() => {
    const urls = [...new Set(Object.values(SPRITE_MAP).map((s) => s.src))];
    let cancelled = false;

    Promise.all(
      urls.map(
        (url) =>
          new Promise<{ url: string; img: HTMLImageElement }>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ url, img });
            img.onerror = () => reject(new Error(`Failed to load ${url}`));
            img.src = url;
          })
      )
    )
      .then((results) => {
        if (cancelled) return;
        const map = new Map<string, HTMLImageElement>();
        for (const { url, img } of results) map.set(url, img);
        imagesRef.current = map;
        setLoaded(true);
      })
      .catch(() => { if (!cancelled) setLoaded(true); });

    return () => { cancelled = true; };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const config = SPRITE_MAP[animation];
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

        // Get the correct image from preloaded map — no flash
        const img = imagesRef.current.get(SPRITE_MAP[animation].src);
        if (img) {
          if (facingLeft) { ctx!.save(); ctx!.scale(-1, 1); ctx!.translate(-size, 0); }

          const fw = img.width / frameCount;
          const sx = frameRef.current * fw;
          ctx!.drawImage(img, sx, 0, fw, img.height, 0, 0, size, size);

          if (facingLeft) ctx!.restore();
        }
      }

      timerRef.current = requestAnimationFrame(loop);
    }

    timerRef.current = requestAnimationFrame(loop);

    return () => { running = false; cancelAnimationFrame(timerRef.current); };
  }, [animation, size, facingLeft, loaded]);

  return <canvas ref={canvasRef} width={size} height={size} className="block" />;
}
