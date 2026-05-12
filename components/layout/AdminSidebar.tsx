"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/admin/dashboard", label: "仪表板" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/posts/new", label: "新建文章" },
  { href: "/admin/categories", label: "分类管理" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkStyle = (href: string) => ({
    color: pathname === href ? "var(--accent-primary)" : "var(--text-secondary)",
    background: pathname === href ? "var(--accent-glow)" : "transparent",
  });

  const content = (
    <>
      <div className="mb-6 px-3">
        <Link href="/admin" className="font-display text-sm" style={{ color: "var(--text-primary)" }}>
          管理后台
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={linkStyle(item.href)}
          >
            <span className="text-lg leading-none" style={{ opacity: pathname === item.href ? 1 : 0.5 }}>&bull;</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-4 space-y-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <Link href="/" className="block px-3 py-2 text-xs rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: "var(--text-muted)" }}>返回前台</Link>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors hover:bg-[var(--bg-elevated)]"
          style={{ color: "var(--text-muted)" }}>退出登录</button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-20 left-3 z-40 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
        onClick={() => setOpen(!open)}
        aria-label="菜单"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-52 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
        <div className="sticky top-16 p-4 flex flex-col h-[calc(100vh-4rem)]">
          {content}
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="md:hidden fixed left-0 top-16 bottom-0 z-50 w-52 animate-fade-in"
            style={{ background: "var(--bg-base)", borderRight: "1px solid var(--border-subtle)" }}>
            <div className="p-4 flex flex-col h-full">
              {content}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
