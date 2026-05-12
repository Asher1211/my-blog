import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { streamChat } from "@/lib/ai/deepseek";
import { PET_SYSTEM_PROMPT, buildArticleChatPrompt, buildSearchPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    if (!message) return Response.json({ error: "缺少消息" }, { status: 400 });

    // Detect if user is asking to find/search articles
    const searchIntent = /搜|找|有没有|相关|文章|帮我查|推荐/.test(message);

    let systemPrompt = PET_SYSTEM_PROMPT;

    if (context?.postId) {
      // User is on an article page — give article context
      const post = await prisma.post.findUnique({
        where: { id: context.postId },
        include: { tags: { select: { tag: { select: { name: true } } } } },
      });
      if (post) {
        systemPrompt = `你是卷卷，博主的小助手。\n\n【读者正在阅读】\n标题：《${post.title}》\n内容：${post.content.slice(0, 3000)}\n\n${PET_SYSTEM_PROMPT}\n\n如果读者问这篇相关的问题，请基于文章内容回答。`;
      }
    }

    if (searchIntent) {
      // Search mode: fetch articles and add them to prompt
      const articles = await prisma.post.findMany({
        where: { published: true },
        select: { title: true, slug: true, excerpt: true, tags: { select: { tag: { select: { name: true } } } } },
        take: 50,
      });
      const articleList = articles.map((a) => ({
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt || "",
        tags: a.tags.map((t) => t.tag.name),
      }));
      systemPrompt = buildSearchPrompt(message, articleList);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChat({
            systemPrompt,
            messages: [{ role: "user" as const, content: message }],
            onChunk: (text) => controller.enqueue(encoder.encode(text)),
          });
          controller.close();
        } catch {
          controller.enqueue(encoder.encode("卷卷睡着了... (´-ω-`)"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return Response.json({ error: "请求失败" }, { status: 500 });
  }
}
