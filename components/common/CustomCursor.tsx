"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    if (!dot || !ring) return;
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    function onMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot!.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    }

    function animate() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring!.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;
      requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    const anim = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(anim);
    };
  }, []);

  return (
    <>
      {/* Small dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none"
        style={{ zIndex: 99999, background: "var(--accent-primary)" }}
      />
      {/* Delay ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none"
        style={{ zIndex: 99998, borderColor: "var(--accent-primary)", opacity: 0.5 }}
      />
    </>
  );
}
