import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug } from "@/lib/data/posts";
import { prisma } from "@/lib/db/prisma";
import { processMarkdown } from "@/lib/markdown/processor";
import { formatDate } from "@/lib/utils/date";
import ScrollProgress from "@/components/common/ScrollProgress";
import TableOfContents from "@/components/common/TableOfContents";
import GiscusComments from "@/components/common/GiscusComments";
import ShareButton from "@/components/common/ShareButton";
import type { Metadata } from "next";

export const revalidate = 60;

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "文章未找到" };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asher1211.blog";
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      type: "article",
      publishedTime: post.publishedAt || post.createdAt,
      url: `${baseUrl}/posts/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  // Prev / next navigation
  const [prevPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, publishedAt: { lt: new Date(post.publishedAt || post.createdAt) } },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.post.findFirst({
      where: { published: true, publishedAt: { gt: new Date(post.publishedAt || post.createdAt) } },
      select: { title: true, slug: true },
      orderBy: { publishedAt: "asc" },
    }),
  ]);

  // Increment view count (fire and forget)
  prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const html = await processMarkdown(post.content);

  return (
    <>
      <ScrollProgress />
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left sidebar */}
          <aside className="lg:w-48 shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <Link href="/posts" className="text-sm flex items-center gap-1 hover:underline"
                style={{ color: "var(--text-muted)" }}>
                ← 返回列表
              </Link>
              <div className="text-xs space-y-2" style={{ color: "var(--text-muted)" }}>
                <p>{post.wordCount} 字</p>
                <p>约 {post.readingTime} 分钟</p>
                <p>{formatDate(post.publishedAt ?? post.createdAt)}</p>
              </div>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link key={tag.slug} href={`/tags/${tag.slug}`}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Article */}
          <article className="flex-1 min-w-0">
            <header className="mb-10">
              {post.category && (
                <Link href={`/categories/${post.category.slug}`}
                  className="inline-block text-xs px-3 py-1 rounded-full mb-4"
                  style={{ background: "var(--accent-glow)", color: "var(--accent-primary)" }}>
                  {post.category.name}
                </Link>
              )}
              <h1 className="font-display text-3xl md:text-4xl mb-4 leading-tight"
                style={{ color: "var(--text-primary)" }}>
                {post.title}
              </h1>
              <div className="flex gap-4 text-sm items-center flex-wrap" style={{ color: "var(--text-muted)" }}>
                <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
                <span>{post.wordCount} 字</span>
                <span>约 {post.readingTime} 分钟</span>
                <span>{post.views} 次阅读</span>
                <ShareButton />
              </div>
            </header>

            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />

            {/* Tags row */}
            {post.tags.length > 0 && (
              <div className="flex gap-2 mt-12 pt-6 flex-wrap" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                {post.tags.map((t) => (
                  <Link key={t.slug} href={`/tags/${t.slug}`}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                    #{t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Prev / Next navigation */}
            <nav className="flex justify-between gap-4 mt-12 pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex-1">
                {prevPost ? (
                  <Link href={`/posts/${prevPost.slug}`} className="block group">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>← 上一篇</span>
                    <span className="block text-sm mt-1 group-hover:underline" style={{ color: "var(--text-secondary)" }}>
                      {prevPost.title}
                    </span>
                  </Link>
                ) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>已是第一篇</span>}
              </div>
              <div className="flex-1 text-right">
                {nextPost ? (
                  <Link href={`/posts/${nextPost.slug}`} className="block group">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>下一篇 →</span>
                    <span className="block text-sm mt-1 group-hover:underline" style={{ color: "var(--text-secondary)" }}>
                      {nextPost.title}
                    </span>
                  </Link>
                ) : <span className="text-xs" style={{ color: "var(--text-muted)" }}>已是最后一篇</span>}
              </div>
            </nav>

            {/* Comments */}
            <GiscusComments />
          </article>

          {/* Right sidebar: TOC */}
          <aside className="lg:w-48 shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
