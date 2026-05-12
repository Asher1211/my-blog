import { prisma } from "@/lib/db/prisma";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateSlug, generateTagSlug } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>新建文章</h1>
      <MarkdownEditor categories={categories} onSave={handleSave} />
    </div>
  );
}

async function handleSave(data: {
  title: string; content: string; slug: string; excerpt: string;
  categoryId: string; tags: string[]; published: boolean; coverImage: string;
}) {
  "use server";
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { calculateReadingTime } = await import("@/lib/utils/reading-time");

  // Ensure slug is ASCII-safe and unique
  let safeSlug = /^[a-z0-9\-]+$/.test(data.slug) ? data.slug : generateSlug(data.slug || data.title);
  // Check for duplicate slug
  const existing = await prisma.post.findUnique({ where: { slug: safeSlug }, select: { id: true } });
  if (existing) {
    safeSlug = `${safeSlug}-${Date.now().toString(36)}`;
  }

  // Upsert tags
  if (data.tags.length > 0) {
    await Promise.all(
      data.tags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          create: { name, slug: generateTagSlug(name) },
          update: {},
        })
      )
    );
  }
  const tagRecords = data.tags.length > 0
    ? await prisma.tag.findMany({ where: { name: { in: data.tags } } })
    : [];

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: safeSlug,
      content: data.content,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
      wordCount: data.content.length,
      readingTime: calculateReadingTime(data.content),
      authorId: session.user.id,
      categoryId: data.categoryId || null,
      ...(tagRecords.length > 0 ? {
        tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/posts");
  redirect(`/admin/posts/${post.id}/edit`);
}
