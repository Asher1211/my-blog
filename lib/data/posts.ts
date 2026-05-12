import { prisma } from "@/lib/db/prisma";
import type { PostListItem, PostDetail } from "@/types";

const POST_LIST_SELECT = {
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
} as const;

export async function getPublishedPosts(page = 1, limit = 10) {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: POST_LIST_SELECT,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  const list: PostListItem[] = posts.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    tags: post.tags.map((t) => t.tag),
  }));

  return {
    posts: list,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await prisma.post.findUnique({
    where: { slug, published: true },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });

  if (!post) return null;

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    tags: post.tags.map((t) => t.tag),
  };
}

export async function getLatestPosts(count = 5) {
  return getPublishedPosts(1, count);
}

export async function getPostsByTag(tag: string, page = 1, limit = 10) {
  const where = { published: true, tags: { some: { tag: { slug: tag } } } };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: POST_LIST_SELECT,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      tags: post.tags.map((t) => t.tag),
    })) as PostListItem[],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPostsByCategory(category: string, page = 1, limit = 10) {
  const where = { published: true, category: { slug: category } };
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: POST_LIST_SELECT,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts: posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      tags: post.tags.map((t) => t.tag),
    })) as PostListItem[],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
