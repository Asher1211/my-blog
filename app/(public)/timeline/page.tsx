import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/date";

export const revalidate = 60;

export default async function TimelinePage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { id: true, title: true, slug: true, publishedAt: true, createdAt: true, wordCount: true, category: { select: { name: true } } },
    orderBy: { publishedAt: "desc" },
  });

  // Group by full date (YYYY-MM-DD)
  const grouped: [string, typeof posts][] = [];
  for (const p of posts) {
    const dateStr = (p.publishedAt || p.createdAt).toISOString().slice(0, 10);
    const last = grouped[grouped.length - 1];
    if (last && last[0] === dateStr) {
      last[1].push(p);
    } else {
      grouped.push([dateStr, [p]]);
    }
  }

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-2" style={{ color: "var(--text-primary)" }}>学习时间线</h1>
      <p className="text-sm mb-12" style={{ color: "var(--text-muted)" }}>{posts.length} 篇文章</p>

      <div className="relative ml-4">
        <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "var(--border-default)" }} />

        <div className="space-y-10">
          {grouped.map(([dateStr, items]) => {
            const [y, m, d] = dateStr.split("-");
            return (
              <section key={dateStr} className="relative pl-10">
                <div
                  className="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-[5px]"
                  style={{ background: "var(--accent-primary)", boxShadow: "var(--accent-glow)" }}
                />
                <h2 className="font-display text-lg mb-4" style={{ color: "var(--text-primary)" }}>
                  {Number(y)}年{Number(m)}月{Number(d)}日
                </h2>
                <div className="space-y-3">
                  {items.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="block p-3 rounded-lg transition-colors hover:translate-x-1 duration-200"
                      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm hover:underline" style={{ color: "var(--text-primary)" }}>
                          {post.title}
                        </span>
                        <span className="text-xs shrink-0" style={{ color: "var(--text-muted)" }}>
                          {post.wordCount} 字
                          {post.category && <span className="ml-2">· {post.category.name}</span>}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
