"use client";

import { useState, useRef, useEffect } from "react";

export default function AiSearchWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      setResult(data.answer || "未找到相关文章");
    } catch {
      setResult("搜索失败，请重试");
    }
    setLoading(false);
  }

  return (
    <>
      {/* Toggle button */}
      {!open && (
        <div className="animate-fade-in">
          <button
            onClick={() => setOpen(true)}
            className="w-full max-w-xl mx-auto px-6 py-3 rounded-full text-sm text-left transition-all"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-muted)",
            }}
          >
            AI 搜索文章...
          </button>
        </div>
      )}

      {/* Expanded search */}
      {open && (
        <div className="animate-fade-in-up max-w-xl mx-auto">
          <form onSubmit={search}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="用自然语言搜索，如「有没有关于 React 的文章」"
                className="flex-1 px-4 py-3 rounded-full text-sm focus:outline-none"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-accent)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full text-sm whitespace-nowrap disabled:opacity-50"
                style={{ background: "var(--accent-primary)", color: "#fff" }}
              >
                {loading ? "搜索中..." : "搜索"}
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setResult(""); setQuery(""); }}
                className="px-3 py-3 rounded-full text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                取消
              </button>
            </div>
          </form>

          {result && (
            <div
              className="mt-4 p-4 rounded-xl text-sm leading-relaxed space-y-1"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              dangerouslySetInnerHTML={{
                __html: result
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
                    '<a href="$2" style="color:var(--accent-secondary);text-decoration:underline;text-underline-offset:2px">$1</a>')
                  .replace(/\n/g, "<br/>")
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
