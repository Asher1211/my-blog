"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils/date";
import type { PostListItem } from "@/types";

interface Props {
  post: PostListItem;
  index?: number;
}

export default function PostCard({ post, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      className="group relative rounded-xl overflow-hidden transition-shadow duration-300 cursor-pointer"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <Link href={`/posts/${post.slug}`} className="block">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-6">
        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
          {post.category && (
            <span className="px-2 py-0.5 rounded-full text-xs" style={{
              background: "var(--accent-glow)",
              color: "var(--accent-primary)",
            }}>
              {post.category.name}
            </span>
          )}
          <span>{post.readingTime} 分钟阅读</span>
        </div>

        {/* Title */}
        <h3
          className="font-display text-xl mb-2 group-hover:opacity-80 transition-opacity"
          style={{ color: "var(--text-primary)" }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {post.tags.map((tag) => (
              <span
                key={tag.slug}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                }}
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Hover glow border */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: "var(--card-hover-shadow)" }}
        />
        </div>
      </Link>
    </motion.article>
  );
}
