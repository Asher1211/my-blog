import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPostsByTag } from "@/lib/data/posts";
import PostCard from "@/components/blog/PostCard";

export const revalidate = 60;

export default async function TagPage({ params }: { params: { tag: string } }) {
  const [tagInfo, { posts }] = await Promise.all([
    prisma.tag.findUnique({ where: { slug: params.tag }, select: { name: true } }),
    getPostsByTag(params.tag),
  ]);

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-2" style={{ color: "var(--text-primary)" }}>
        标签: {tagInfo?.name ?? params.tag}
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        {posts.length} 篇文章
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          该标签下暂无文章
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
