import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { streamChat } from "@/lib/ai/deepseek";
import { buildArticleChatPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { postId, question, history } = await req.json();

    if (!postId || !question) {
      return Response.json({ error: "缺少参数" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { tags: { select: { tag: { select: { name: true } } } } },
    });

    if (!post) {
      return Response.json({ error: "文章不存在" }, { status: 404 });
    }

    const systemPrompt = buildArticleChatPrompt({
      title: post.title,
      content: post.content,
      tags: post.tags.map((t) => t.tag.name),
    });

    const messages = [
      ...(history || []).slice(-10),
      { role: "user" as const, content: question },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChat({
            systemPrompt,
            messages,
            onChunk: (text) => {
              controller.enqueue(encoder.encode(text));
            },
          });
          controller.close();
        } catch {
          controller.enqueue(encoder.encode("[AI 暂时无法回复，请稍后重试]"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    return Response.json({ error: "请求失败" }, { status: 500 });
  }
}
