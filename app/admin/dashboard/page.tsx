import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [postCount, publishedCount, categoryCount, tagCount, wordAgg] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.post.aggregate({ _sum: { wordCount: true } }),
  ]);

  const totalWords = wordAgg._sum.wordCount || 0;

  const stats = [
    { label: "文章总数", value: postCount },
    { label: "已发布", value: publishedCount },
    { label: "总字数", value: `${(totalWords / 1000).toFixed(1)}k` },
    { label: "分类", value: categoryCount },
    { label: "标签", value: tagCount },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>仪表板</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="font-display text-2xl mb-1" style={{ color: "var(--accent-primary)" }}>{s.value}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
