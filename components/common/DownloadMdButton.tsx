"use client";

import { useState } from "react";

interface Props {
  content: string;
  title: string;
}

export default function DownloadMdButton({ content, title }: Props) {
  const [downloaded, setDownloaded] = useState(false);

  function download() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all"
      style={{
        background: downloaded ? "var(--accent-glow)" : "var(--bg-elevated)",
        color: downloaded ? "var(--accent-primary)" : "var(--text-muted)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {downloaded ? (
        <>已下载 ✓</>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          下载 .md
        </>
      )}
    </button>
  );
}
