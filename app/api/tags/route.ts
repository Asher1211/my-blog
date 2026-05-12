import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const tags = await prisma.tag.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return Response.json(tags);
}
