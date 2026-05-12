import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { chat } from "@/lib/ai/deepseek";
import { buildSearchPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return Response.json({ error: "缺少查询" }, { status: 400 });

    // Fetch all published posts for the AI to search through
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        tags: { select: { tag: { select: { name: true } } } },
      },
      take: 50,
    });

    const articles = posts.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      tags: p.tags.map((t) => t.tag.name),
    }));

    const systemPrompt = buildSearchPrompt(query, articles);
    const answer = await chat({ systemPrompt, messages: [] });

    return Response.json({ answer });
  } catch {
    return Response.json({ error: "搜索失败" }, { status: 500 });
  }
}
