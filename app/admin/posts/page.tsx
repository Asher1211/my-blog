import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/date";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";
import PageSizeSelect from "@/components/common/PageSizeSelect";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: { page?: string; limit?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(50, Math.max(5, Number(searchParams.limit) || 15));

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      select: {
        id: true, title: true, slug: true, published: true,
        views: true, wordCount: true, createdAt: true, publishedAt: true,
        category: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>
          文章管理 <span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>共 {total} 篇</span>
        </h1>
        <div className="flex items-center gap-3">
          <PageSizeSelect
            value={limit}
            options={[5, 10, 15, 30]}
            onChange={(v) => {
              window.location.href = `/admin/posts?limit=${v}`;
            }}
          />
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "var(--accent-primary)", color: "#fff" }}
          >
            新建文章
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>还没有文章</p>
          <Link href="/admin/posts/new" style={{ color: "var(--accent-secondary)" }}>创建第一篇</Link>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-[var(--bg-elevated)]"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="text-sm font-medium truncate hover:underline"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {post.title}
                    </Link>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                      style={{
                        background: post.published ? "rgba(34,197,94,0.1)" : "var(--accent-glow)",
                        color: post.published ? "#22c55e" : "var(--accent-primary)",
                      }}
                    >
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                    {post.category && <span>{post.category.name}</span>}
                    <span>{post.views} 阅读</span>
                    <span>{post.wordCount} 字</span>
                    <span className="hidden sm:inline">{formatDate(post.publishedAt || post.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    target="_blank"
                    className="text-xs px-2.5 py-1.5 rounded transition-colors hover:bg-[var(--bg-elevated)]"
                    style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                  >
                    查看
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-xs px-2.5 py-1.5 rounded transition-colors hover:bg-[var(--bg-elevated)]"
                    style={{ color: "var(--accent-secondary)", border: "1px solid var(--border-subtle)" }}
                  >
                    编辑
                  </Link>
                  <DeleteButton postId={post.id} action={deletePost} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              {page > 1 && (
                <Link
                  href={`/admin/posts?page=${page - 1}&limit=${limit}`}
                  className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                  style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
                >
                  ← 上一页
                </Link>
              )}
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/admin/posts?page=${page + 1}&limit=${limit}`}
                  className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--bg-elevated)]"
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

async function deletePost(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
}
