import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";
import { generateCategorySlug } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>分类管理</h1>

      <form action={addCategory} className="flex gap-2 mb-6">
        <input name="name" required placeholder="分类名称" className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        <input name="description" placeholder="描述(可选)" className="w-32 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        <input name="color" placeholder="#颜色" className="w-20 px-3 py-2 rounded-lg text-sm focus:outline-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
        <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent-primary)", color: "#fff" }}>
          添加
        </button>
      </form>

      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-3">
              {cat.color && <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />}
              <span className="text-sm" style={{ color: "var(--text-primary)" }}>{cat.name}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({cat._count.posts} 篇)</span>
            </div>
            <DeleteButton postId={cat.id} action={deleteCategory} />
          </div>
        ))}
      </div>
    </div>
  );
}

async function addCategory(formData: FormData) {
  "use server";
  const name = (formData.get("name") as string)?.trim();
  const color = (formData.get("color") as string) || null;
  if (!name) return;

  const description = (formData.get("description") as string) || null;
  const slug = generateCategorySlug(name);

  await prisma.category.upsert({
    where: { name },
    create: { name, slug, color, description },
    update: { color: color || undefined, description: description || null },
  });

  revalidatePath("/admin/categories");
}

async function deleteCategory(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
