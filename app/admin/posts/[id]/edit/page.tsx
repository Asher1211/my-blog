import { prisma } from "@/lib/db/prisma";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface Props { params: { id: string } }

export default async function EditPostPage({ params }: Props) {
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.id },
      include: { tags: { select: { tag: true } } },
    }),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="font-display text-2xl mb-6" style={{ color: "var(--text-primary)" }}>编辑文章</h1>
      <MarkdownEditor
        categories={categories}
        initialTitle={post.title}
        initialContent={post.content}
        initialSlug={post.slug}
        initialExcerpt={post.excerpt || ""}
        initialCategoryId={post.categoryId || ""}
        initialTags={post.tags.map((t) => t.tag.name)}
        initialPublished={post.published}
        initialCoverImage={post.coverImage || ""}
        isEditing
        onSave={async (data) => {
          "use server";
          await updatePost(params.id, !!post!.publishedAt, data);
        }}
      />
    </div>
  );
}

async function updatePost(
  postId: string,
  hadPublishedAt: boolean,
  data: {
    title: string; content: string; slug: string; excerpt: string;
    categoryId: string; tags: string[]; published: boolean; coverImage: string;
  }
) {
  "use server";
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const { calculateReadingTime } = await import("@/lib/utils/reading-time");
  const { generateSlug, generateTagSlug } = await import("@/lib/utils/slug");

  let safeSlug = /^[a-z0-9\-]+$/.test(data.slug) ? data.slug : generateSlug(data.slug || data.title);
  const dup = await prisma.post.findFirst({ where: { slug: safeSlug, id: { not: postId } }, select: { id: true } });
  if (dup) safeSlug = `${safeSlug}-${Date.now().toString(36)}`;

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

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      title: data.title,
      slug: safeSlug,
      content: data.content,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      published: data.published,
      publishedAt: data.published && !hadPublishedAt ? new Date() : undefined,
      wordCount: data.content.length,
      readingTime: calculateReadingTime(data.content),
      categoryId: data.categoryId || null,
      ...(data.tags.length > 0 || tagRecords.length > 0 ? {
        tags: {
          deleteMany: {},
          create: tagRecords.map((t) => ({ tagId: t.id })),
        },
      } : {}),
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);
  redirect(`/admin/posts/${post.id}/edit`);
}
