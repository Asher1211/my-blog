"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CategoryInfo {
  id: string; name: string; slug: string; color: string | null;
  _count: { posts: number };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  const filtered = categories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-6" style={{ color: "var(--text-primary)" }}>所有分类</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索分类..."
        className="w-full max-w-sm px-4 py-2.5 rounded-full text-sm focus:outline-none mb-8"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
      />

      {loading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>加载中...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>没有找到分类</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="block p-5 rounded-xl transition-all hover:translate-y-[-2px]"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                {c.color && <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />}
                <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{c.name}</span>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{c._count.posts} 篇文章</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
