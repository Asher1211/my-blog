import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getLatestPosts } from "@/lib/data/posts";
import PostCard from "@/components/blog/PostCard";

export const revalidate = 60; // ISR: 每60秒刷新

export default async function HomePage() {
  const [{ posts }, tagCount, categoryCount] = await Promise.all([
    getLatestPosts(6),
    prisma.tag.count(),
    prisma.category.count(),
  ]);

  return (
    <div className="max-w-content mx-auto px-6 pb-16">
      {/* Hero */}
      <section className="py-20 md:py-32 text-center relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10">
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mb-4 tracking-tight animate-fade-in-up"
            style={{ color: "var(--text-primary)" }}>
            数字档案馆
          </h1>
          <p className="text-lg md:text-xl max-w-lg mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.15s", color: "var(--text-secondary)" }}>
            以学习记录为核心，用光影书写技术的脉络
          </p>
          <div className="mt-8 flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <Link
              href="/posts"
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                background: "var(--accent-primary)",
                color: "#fff",
              }}
            >
              浏览文章
            </Link>
            <Link
              href="/timeline"
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              时间线
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
        {[
          { label: "文章", value: posts.length },
          { label: "标签", value: tagCount },
          { label: "分类", value: categoryCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded-xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="font-display text-2xl" style={{ color: "var(--accent-primary)" }}>
              {stat.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Latest posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>
            最新文章
          </h2>
          <Link
            href="/posts"
            className="text-sm transition-colors hover:underline"
            style={{ color: "var(--accent-secondary)" }}
          >
            查看全部 →
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <p className="text-lg">还没有文章，静候光影记录...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
