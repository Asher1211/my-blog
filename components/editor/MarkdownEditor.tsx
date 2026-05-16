"use client";

import { useState, useEffect, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import { generateSlug } from "@/lib/utils/slug";
import ImageUploader from "./ImageUploader";

interface EditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialExcerpt?: string;
  initialSlug?: string;
  initialCategoryId?: string;
  initialTags?: string[];
  initialPublished?: boolean;
  initialCoverImage?: string;
  categories?: { id: string; name: string }[];
  onSave: (data: EditorData) => Promise<void>;
  isEditing?: boolean;
}

export interface EditorData {
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  published: boolean;
  coverImage: string;
}

const STORAGE_KEY = "blog-draft";

export default function MarkdownEditor({
  initialTitle = "",
  initialContent = "",
  initialExcerpt = "",
  initialSlug = "",
  initialCategoryId = "",
  initialTags = [],
  initialPublished = false,
  initialCoverImage = "",
  categories = [],
  onSave,
  isEditing = false,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialTags);
  const [published, setPublished] = useState(initialPublished);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"write" | "settings">("write");
  const loadedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title, slug, isEditing]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (isEditing || !title || !content) return;
    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ title, content, slug, excerpt, categoryId, tags, coverImage })
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, slug, excerpt, categoryId, tags, coverImage, isEditing]);

  // Load draft on mount
  useEffect(() => {
    if (isEditing || loadedRef.current) return;
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        if (d.title) setTitle(d.title);
        if (d.content) setContent(d.content);
        if (d.slug) setSlug(d.slug);
        if (d.excerpt) setExcerpt(d.excerpt);
        if (d.tags) setTags(d.tags);
      } catch { /* ignore */ }
    }
    loadedRef.current = true;
  }, [isEditing]);

  function addTag() {
    const name = tagInput.trim();
    if (name && !tags.includes(name)) {
      setTags([...tags, name]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSave(publish: boolean) {
    if (!title.trim() || !content.trim()) {
      setMessage("标题和内容不能为空");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await onSave({
        title: title.trim(),
        content,
        slug: slug || generateSlug(title),
        excerpt,
        categoryId,
        tags,
        published: publish,
        coverImage,
      });
      if (!isEditing) {
        localStorage.removeItem(STORAGE_KEY);
      }
      setMessage(publish ? "发布成功！" : "保存草稿成功");
    } catch {
      setMessage("保存失败，请重试");
    }
    setSaving(false);
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors";
  const inputStyle = {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    color: "var(--text-primary)",
  };
  const labelStyle = { color: "var(--text-secondary)", fontSize: "0.8rem" };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-50"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            保存草稿
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent-primary)", color: "#fff" }}
          >
            {isEditing ? "更新" : "发布"}
          </button>
          {message && (
            <span className="text-sm" style={{ color: message.includes("失败") ? "#e05555" : "var(--accent-primary)" }}>
              {message}
            </span>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border-default)" }}>
          <button
            onClick={() => setTab("write")}
            className="px-3 py-1.5 text-xs transition-colors"
            style={{ background: tab === "write" ? "var(--bg-elevated)" : "transparent", color: "var(--text-secondary)" }}
          >
            编辑
          </button>
          <button
            onClick={() => setTab("settings")}
            className="px-3 py-1.5 text-xs transition-colors"
            style={{ background: tab === "settings" ? "var(--bg-elevated)" : "transparent", color: "var(--text-secondary)" }}
          >
            发布设置
          </button>
        </div>
      </div>

      {tab === "settings" ? (
        /* Settings panel */
        <div className="grid gap-4 sm:grid-cols-2 p-6 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div className="sm:col-span-2">
            <label style={labelStyle}>标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} placeholder="文章标题" />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} style={inputStyle} placeholder="article-slug" />
          </div>
          <div>
            <label style={labelStyle}>分类</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} style={inputStyle}>
              <option value="">无分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>标签（回车添加）</label>
            <div className="flex gap-1 mb-1 flex-wrap">
              {tags.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1"
                  style={{ background: "var(--accent-glow)", color: "var(--accent-primary)" }}
                  onClick={() => removeTag(t)}>
                  {t} ×
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              className={inputClass} style={inputStyle}
              placeholder="输入标签后回车"
            />
          </div>
          <div>
            <label style={labelStyle}>封面图</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={inputClass} style={inputStyle} placeholder="输入 URL 或上传图片" />
            <div className="mt-2">
              <ImageUploader onUploaded={(url) => setCoverImage(url)} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label style={labelStyle}>摘要</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2}
              className={inputClass} style={inputStyle} placeholder="文章摘要（可选）" />
          </div>
        </div>
      ) : (
        /* Editor area */
        <div className="flex-1 min-h-[60vh]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-display mb-4 px-2 py-1 bg-transparent focus:outline-none"
            style={{ color: "var(--text-primary)", border: "none" }}
            placeholder="文章标题..."
          />
          <div className="flex items-center gap-2 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setContent(ev.target?.result as string);
                reader.readAsText(file);
                e.target.value = "";
              }}
              hidden
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1 rounded-full transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              导入 .md 文件
            </button>
            <ImageUploader compact onUploaded={(url) => setContent(content + `\n![](${url})\n`)} />
          </div>
          <MDEditor
            value={content}
            onChange={(v) => setContent(v || "")}
            height={500}
            visibleDragbar={false}
            preview="live"
          />
        </div>
      )}
    </div>
  );
}
