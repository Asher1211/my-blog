"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TagInfo {
  id: string; name: string; slug: string;
  _count: { posts: number };
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tags").then(r => r.json()).then(data => {
      setTags(data);
      setLoading(false);
    });
  }, []);

  const filtered = tags.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-6" style={{ color: "var(--text-primary)" }}>所有标签</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索标签..."
        className="w-full max-w-sm px-4 py-2.5 rounded-full text-sm focus:outline-none mb-8"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
      />

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>加载中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>没有找到标签</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {filtered.map((t) => (
            <Link
              key={t.id}
              href={`/tags/${t.slug}`}
              className="px-4 py-2.5 rounded-full text-sm transition-all hover:scale-105"
              style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
            >
              #{t.name}
              <span className="ml-1.5 text-xs" style={{ color: "var(--text-muted)" }}>{t._count.posts}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
