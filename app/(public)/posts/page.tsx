import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/posts";
import PostCard from "@/components/blog/PostCard";

export const revalidate = 60;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, pagination } = await getPublishedPosts(page);

  return (
    <div className="max-w-content mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-8" style={{ color: "var(--text-primary)" }}>
        所有文章
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
          还没有文章
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              {page > 1 && (
                <Link
                  href={`/posts?page=${page - 1}`}
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
                  href={`/posts?page=${page + 1}`}
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
