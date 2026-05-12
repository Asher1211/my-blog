import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q.trim()) return Response.json({ posts: [] });

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q } },
        { content: { contains: q } },
        { excerpt: { contains: q } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json({
    posts: posts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}
