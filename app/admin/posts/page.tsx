import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils/date";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    select: {
      id: true, title: true, slug: true, published: true,
      views: true, wordCount: true, createdAt: true, publishedAt: true,
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl" style={{ color: "var(--text-primary)" }}>文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-primary)", color: "#fff" }}
        >
          新建文章
        </Link>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th className="text-left p-3" style={{ color: "var(--text-muted)" }}>标题</th>
              <th className="text-left p-3 hidden sm:table-cell" style={{ color: "var(--text-muted)" }}>状态</th>
              <th className="text-left p-3 hidden md:table-cell" style={{ color: "var(--text-muted)" }}>分类</th>
              <th className="text-left p-3 hidden md:table-cell" style={{ color: "var(--text-muted)" }}>阅读</th>
              <th className="text-left p-3 hidden md:table-cell" style={{ color: "var(--text-muted)" }}>字数</th>
              <th className="text-left p-3 hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>日期</th>
              <th className="text-right p-3" style={{ color: "var(--text-muted)" }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{ color: "var(--text-muted)" }}>
                  还没有文章，<Link href="/admin/posts/new" style={{ color: "var(--accent-secondary)" }}>创建第一篇</Link>
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="p-3">
                    <Link href={`/admin/posts/${post.id}/edit`} className="hover:underline" style={{ color: "var(--text-primary)" }}>
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                      background: post.published ? "rgba(34,197,94,0.1)" : "var(--accent-glow)",
                      color: post.published ? "#22c55e" : "var(--accent-primary)",
                    }}>
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell" style={{ color: "var(--text-secondary)" }}>
                    {post.category?.name || "-"}
                  </td>
                  <td className="p-3 hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                    {post.views}
                  </td>
                  <td className="p-3 hidden md:table-cell" style={{ color: "var(--text-muted)" }}>
                    {post.wordCount}
                  </td>
                  <td className="p-3 hidden lg:table-cell" style={{ color: "var(--text-muted)" }}>
                    {formatDate(post.publishedAt || post.createdAt)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/posts/${post.slug}`}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                        target="_blank">
                        查看
                      </Link>
                      <Link href={`/admin/posts/${post.id}/edit`}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ color: "var(--accent-secondary)", border: "1px solid var(--border-subtle)" }}>
                        编辑
                      </Link>
                      <DeleteButton postId={post.id} action={deletePost} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function deletePost(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
}
