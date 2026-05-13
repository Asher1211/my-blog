"use client";

import { useEffect, useState } from "react";

export default function GitHubStar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("https://api.github.com/repos/Asher1211/my-blog")
      .then((r) => r.json())
      .then((d) => { if (d.stargazers_count) setCount(d.stargazers_count); })
      .catch(() => {});
  }, []);

  return (
    <a
      href="https://github.com/Asher1211/my-blog"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all hover:scale-105"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--text-muted)" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span>Star</span>
      {count > 0 && (
        <span className="px-1.5 py-0.5 rounded-full text-xs ml-0.5"
          style={{ background: "var(--accent-glow)", color: "var(--accent-primary)" }}>
          {count}
        </span>
      )}
    </a>
  );
}
