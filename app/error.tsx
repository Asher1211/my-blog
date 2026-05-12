"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html>
      <body style={{ background: "#0a0a0f", color: "#e8e6e0", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "3rem", color: "#d4a854", marginBottom: "1rem" }}>服务异常</h1>
            <p style={{ color: "#989890", marginBottom: "2rem" }}>
              博客暂时无法访问，请稍后重试。
            </p>
            <button onClick={reset}
              style={{ padding: "0.6rem 1.5rem", borderRadius: "2rem", background: "#d4a854", color: "#fff", border: "none", cursor: "pointer", marginRight: "0.5rem" }}>
              重试
            </button>
            <Link href="/"
              style={{ padding: "0.6rem 1.5rem", borderRadius: "2rem", border: "1px solid rgba(255,255,255,0.1)", color: "#989890", textDecoration: "none", fontSize: "0.9rem" }}>
              返回首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
