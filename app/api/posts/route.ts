import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, unauthorized } from "@/lib/auth/api-helpers";
import { generateSlug } from "@/lib/utils/slug";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { z } from "zod";
import type { PostListItem } from "@/types";

const POST_LIMIT = 10;

const CreatePostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  published: z.boolean().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || POST_LIMIT));
  const slug = searchParams.get("slug");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status") || "published";
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = {};

  if (slug) {
    where.slug = slug;
  } else if (status !== "all") {
    where.published = status === "published";
  }

  if (category) {
    where.category = { slug: category };
  }

  if (tag) {
    where.tags = { some: { tag: { slug: tag } } };
  }

  const orderBy = { [sort]: order };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        published: true,
        views: true,
        wordCount: true,
        readingTime: true,
        createdAt: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const list: PostListItem[] = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    tags: post.tags.map((t) => t.tag),
  }));

  return NextResponse.json({
    posts: list,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "无效的 JSON" }, { status: 400 });
  }

  const parsed = CreatePostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "验证失败", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, content, excerpt, coverImage, published, categoryId, tags } = parsed.data;
  const slug = generateSlug(title);
  const wordCount = content.length;
  const readingTime = calculateReadingTime(content);

  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "已存在相同标题的文章，请修改标题" },
      { status: 409 }
    );
  }

  const session = await import("@/auth").then((m) => m.auth());
  if (!session?.user?.id) return unauthorized();

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
      wordCount,
      readingTime,
      authorId: session.user.id,
      categoryId: categoryId || null,
      tags: tags?.length
        ? {
            create: tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName, slug: generateSlug(tagName) },
                },
              },
            })),
          }
        : undefined,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
