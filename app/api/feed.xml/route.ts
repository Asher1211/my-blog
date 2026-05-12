import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asher1211.blog";
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { title: true, slug: true, excerpt: true, publishedAt: true, createdAt: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const items = posts.map((p) => {
    const date = (p.publishedAt || p.createdAt).toUTCString();
    return `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseUrl}/posts/${p.slug}</link>
      <guid>${baseUrl}/posts/${p.slug}</guid>
      <description><![CDATA[${p.excerpt || ""}]]></description>
      <pubDate>${date}</pubDate>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>数字档案馆</title>
    <link>${baseUrl}</link>
    <description>以学习记录为核心的个人博客</description>
    <language>zh-CN</language>
    <atom:link href="${baseUrl}/api/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
