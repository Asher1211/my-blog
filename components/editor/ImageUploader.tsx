"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onUploaded: (url: string) => void;
  compact?: boolean;
}

export default function ImageUploader({ onUploaded, compact }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        onUploaded(data.url);
      } else {
        alert(data.error || "上传失败");
      }
    } catch {
      alert("上传失败");
    }
    setUploading(false);
  }, [onUploaded]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }, [upload]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = "";
  }, [upload]);

  if (compact) {
    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs px-3 py-1 rounded-full transition-all"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          {uploading ? "上传中..." : "上传图片"}
        </button>
      </>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        dragOver ? "opacity-80" : ""
      }`}
      style={{
        borderColor: dragOver ? "var(--accent-primary)" : "var(--border-default)",
        background: dragOver ? "var(--accent-glow)" : "var(--bg-elevated)",
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      {uploading ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>上传中...</p>
      ) : (
        <>
          <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            拖拽图片到此处或点击上传
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            JPG / PNG / GIF / WebP
          </p>
        </>
      )}
    </div>
  );
}
