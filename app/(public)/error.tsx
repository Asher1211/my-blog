"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="font-display text-5xl mb-4" style={{ color: "var(--accent-primary)" }}>出错了</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          页面加载失败，可能是网络波动或数据库连接超时。
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={reset} className="px-5 py-2 rounded-full text-sm font-medium"
            style={{ background: "var(--accent-primary)", color: "#fff" }}>
            重试
          </button>
          <Link href="/" className="px-5 py-2 rounded-full text-sm font-medium"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
