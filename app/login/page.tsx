"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("邮箱或密码错误");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  }

  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
    transition: "border-color 0.2s",
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-sm p-8 rounded-2xl backdrop-blur"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-glow)" }}
          >
            <span className="font-mono text-lg" style={{ color: "var(--accent-primary)" }}>A</span>
          </div>
          <h1 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>
            博主登录
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            数字档案馆 · 管理后台
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="text-sm p-3 rounded-lg"
              style={{ background: "rgba(200,50,50,0.1)", color: "#e05555", border: "1px solid rgba(200,50,50,0.2)" }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@blog.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="······"
              className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none placeholder:text-[var(--text-muted)]"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: "var(--accent-primary)", color: "#fff" }}
          >
            {loading ? "验证中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
      <LoginForm />
    </Suspense>
  );
}
