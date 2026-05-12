"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll(".markdown-content h2, .markdown-content h3"));
    const toc: TOCItem[] = headings.map((h, i) => {
      const id = `toc-${i}`;
      h.id = id;
      return {
        id,
        text: h.textContent || "",
        level: h.tagName === "H2" ? 2 : 3,
      };
    });
    setItems(toc);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav>
      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>目录</p>
      <div className="w-full h-px mb-3" style={{ background: "var(--border-subtle)" }} />
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: item.level === 3 ? "12px" : "0" }}>
            <a
              href={`#${item.id}`}
              className="block text-xs py-0.5 transition-colors truncate"
              style={{
                color: activeId === item.id ? "var(--accent-primary)" : "var(--text-muted)",
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
