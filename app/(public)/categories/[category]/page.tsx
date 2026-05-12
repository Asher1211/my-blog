import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPostsByCategory } from "@/lib/data/posts";
import PostCard from "@/components/blog/PostCard";

export const revalidate = 60;

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const [catInfo, { posts }] = await Promise.all([
    prisma.category.findUnique({ where: { slug: params.category }, select: { name: true } }),
    getPostsByCategory(params.category),
  ]);

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-2" style={{ color: "var(--text-primary)" }}>
        分类: {catInfo?.name ?? params.category}
      </h1>
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
