import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, color: true, _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });
  return Response.json(categories);
}
