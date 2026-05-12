import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPostsByCategory } from "@/lib/data/posts";
import PostCard from "@/components/blog/PostCard";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const [catInfo, { posts }] = await Promise.all([
    prisma.category.findUnique({ where: { slug: params.category }, select: { name: true, description: true, color: true } }),
    getPostsByCategory(params.category),
  ]);

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        {catInfo?.color && <span className="w-4 h-4 rounded-full" style={{ background: catInfo.color }} />}
        <h1 className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>
          {catInfo?.name ?? params.category}
        </h1>
      </div>
      {catInfo?.description && (
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{catInfo.description}</p>
      )}
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        {posts.length} 篇文章
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          该分类下暂无文章
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
