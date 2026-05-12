"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/common/ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/timeline", label: "时间线" },
  { href: "/about", label: "关于" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
      style={{ background: "color-mix(in srgb, var(--bg-base) 85%, transparent)", borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-content mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-wide hover:opacity-80 shrink-0"
          style={{ color: "var(--text-primary)" }}>
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono"
            style={{ background: "var(--accent-glow)", color: "var(--accent-primary)" }}>A</span>
          <span className="hidden sm:inline">数字档案馆</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className="relative px-3 py-1.5 text-sm rounded-full transition-colors duration-200"
                style={{ color: isActive ? "var(--accent-primary)" : "var(--text-secondary)", background: isActive ? "var(--accent-glow)" : "transparent" }}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="搜索"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: "var(--text-secondary)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </Link>
          <Link href="/login" aria-label="后台登录"
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-elevated)]"
            style={{ color: "var(--text-muted)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
          </Link>
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="菜单"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden px-4 pb-4 space-y-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm transition-colors"
                style={{ color: isActive ? "var(--accent-primary)" : "var(--text-secondary)", background: isActive ? "var(--accent-glow)" : "transparent" }}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
