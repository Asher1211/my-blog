import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getPublishedPosts, getPostsByTag, getPostsByCategory } from "@/lib/data/posts";
import PostCard from "@/components/blog/PostCard";
import type { PostListItem } from "@/types";

export const revalidate = 60;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string; tag?: string; category?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const activeTag = searchParams.tag || "";
  const activeCategory = searchParams.category || "";

  // Fetch posts based on filter
  let posts: PostListItem[] = [];
  let pagination = { page, limit: 10, total: 0, totalPages: 1 };

  if (activeTag) {
    const result = await getPostsByTag(activeTag, page);
    posts = result.posts;
    pagination = result.pagination;
  } else if (activeCategory) {
    const result = await getPostsByCategory(activeCategory, page);
    posts = result.posts;
    pagination = result.pagination;
  } else {
    const result = await getPublishedPosts(page);
    posts = result.posts;
    pagination = result.pagination;
  }

  // Fetch all categories and tags for filter chips
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } }),
  ]);

  const baseHref = (p: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/posts?${params.toString()}`;
  };

  const chipStyle = (active: boolean) => ({
    background: active ? "var(--accent-glow)" : "var(--bg-elevated)",
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
  });

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-6" style={{ color: "var(--text-primary)" }}>
        文章 {activeTag && <span className="text-lg">· #{activeTag}</span>}
        {activeCategory && <span className="text-lg">· {categories.find(c => c.slug === activeCategory)?.name || activeCategory}</span>}
      </h1>

      {/* Filter chips */}
      <div className="mb-8 space-y-3">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs mr-1" style={{ color: "var(--text-muted)" }}>分类:</span>
          <Link href="/posts" className="text-xs px-3 py-1 rounded-full transition-colors"
            style={chipStyle(!activeCategory)}>
            全部
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={activeCategory === c.slug ? "/posts" : baseHref({ category: c.slug })}
              className="text-xs px-3 py-1 rounded-full transition-colors"
              style={chipStyle(activeCategory === c.slug)}
            >
              {c.name} ({c._count.posts})
            </Link>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs mr-1" style={{ color: "var(--text-muted)" }}>标签:</span>
          <Link href="/posts" className="text-xs px-3 py-1 rounded-full transition-colors"
            style={chipStyle(!activeTag)}>
            全部
          </Link>
          {tags.filter(t => t._count.posts > 0).map((t) => (
            <Link
              key={t.id}
              href={activeTag === t.slug ? "/posts" : baseHref({ tag: t.slug })}
              className="text-xs px-3 py-1 rounded-full transition-colors"
              style={chipStyle(activeTag === t.slug)}
            >
              #{t.name} ({t._count.posts})
            </Link>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          该筛选条件下还没有文章
        </div>
      ) : (
        <>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {pagination.total} 篇文章
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              {page > 1 && (
                <Link
                  href={baseHref({ page: String(page - 1), tag: activeTag, category: activeCategory })}
                  className="px-4 py-2 rounded-full text-sm transition-colors"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                >
                  ← 上一页
                </Link>
              )}
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {page} / {pagination.totalPages}
              </span>
              {page < pagination.totalPages && (
                <Link
                  href={baseHref({ page: String(page + 1), tag: activeTag, category: activeCategory })}
                  className="px-4 py-2 rounded-full text-sm transition-colors"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                >
                  下一页 →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
