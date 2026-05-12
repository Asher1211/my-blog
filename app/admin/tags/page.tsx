import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";
import { generateTagSlug } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>标签管理</h1>

      <form action={addTag} className="flex gap-2 mb-6">
        <input name="name" required placeholder="标签名称"
          className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent-primary)", color: "#fff" }}>
          添加
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>还没有标签</p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>#{tag.name}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({tag._count.posts})</span>
              <DeleteButton postId={tag.id} action={deleteTag} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

async function addTag(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  const slug = generateTagSlug(name);
  await prisma.tag.upsert({
    where: { name },
    create: { name, slug },
    update: {},
  });
  revalidatePath("/admin/tags");
}

async function deleteTag(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await prisma.tagsOnPosts.deleteMany({ where: { tagId: id } });
    await prisma.tag.delete({ where: { id } });
  }
  revalidatePath("/admin/tags");
}
