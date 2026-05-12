import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin, notFound, unauthorized } from "@/lib/auth/api-helpers";
import { generateSlug } from "@/lib/utils/slug";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import type { PostDetail } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      category: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });

  if (!post) return notFound();

  const detail: PostDetail = {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    tags: post.tags.map((t) => t.tag),
  };

  return NextResponse.json(detail);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const existing = await prisma.post.findUnique({
    where: { id: params.id },
  });
  if (!existing) return notFound();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "无效的 JSON" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) {
    updateData.title = body.title;
    updateData.slug = generateSlug(body.title as string);
  }
  if (typeof body.content === "string") {
    updateData.content = body.content;
    updateData.wordCount = (body.content as string).length;
    updateData.readingTime = calculateReadingTime(body.content as string);
  }
  if (body.excerpt !== undefined) {
    updateData.excerpt = body.excerpt || null;
  }
  if (body.coverImage !== undefined) {
    updateData.coverImage = body.coverImage || null;
  }
  if (typeof body.published === "boolean") {
    updateData.published = body.published;
    if (body.published && !existing.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }
  if (body.categoryId !== undefined) {
    updateData.categoryId = body.categoryId || null;
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(post);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const existing = await prisma.post.findUnique({
    where: { id: params.id },
  });
  if (!existing) return notFound();

  await prisma.post.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
