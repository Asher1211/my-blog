"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.posts || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8" style={{ color: "var(--text-primary)" }}>搜索文章</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键字..."
          className="flex-1 px-4 py-3 rounded-full text-sm focus:outline-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-full text-sm font-medium disabled:opacity-40"
          style={{ background: "var(--accent-primary)", color: "#fff" }}
        >
          搜索
        </button>
      </form>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>搜索中...</p>}

      {searched && !loading && (
        <div className="space-y-3">
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            找到 {results.length} 篇相关文章
          </p>
          {results.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>未找到相关文章</p>
          ) : (
            results.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                className="block p-4 rounded-xl transition-colors hover:translate-x-1 duration-200"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
              >
                <h3 className="font-display text-base mb-1" style={{ color: "var(--text-primary)" }}>{post.title}</h3>
                {post.excerpt && <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{post.excerpt}</p>}
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatDate(post.createdAt)}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
