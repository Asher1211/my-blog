"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PetSprite from "./PetSprite";
import type { PetAnimation } from "./PetSprite";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

const CHAT_KEY = "pet-chat-history";
const POS_KEY = "pet-position-v3";

export default function DeskPet() {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [initialized, setInitialized] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [bubble, setBubble] = useState("");
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragDist = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  posRef.current = pos;

  const PET_SIZE = 80;

  // Init position
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    let savedPos = { x: w - PET_SIZE - 30, y: h - PET_SIZE - 120 };

    try {
      const saved = localStorage.getItem(POS_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.x === "number") savedPos.x = Math.min(Math.max(p.x, 0), w - PET_SIZE);
        if (typeof p.y === "number") savedPos.y = Math.min(Math.max(p.y, 48), h - PET_SIZE);
      }
      const savedChat = localStorage.getItem(CHAT_KEY);
      if (savedChat) setChatMessages(JSON.parse(savedChat));
    } catch { /* ignore */ }

    setPos(savedPos);
    setInitialized(true);
  }, []);

  // Save chat
  useEffect(() => {
    if (chatMessages.length) {
      try { localStorage.setItem(CHAT_KEY, JSON.stringify(chatMessages)); } catch { /* ignore */ }
    }
  }, [chatMessages]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streaming]);

  // Idle bubbles
  useEffect(() => {
    if (!initialized) return;
    const bubbles = ["点我可以聊天哦 (´ω`)", "有什么可以帮你？", "想找文章吗？问我！", "你好呀～我是卷卷"];
    const t0 = setTimeout(() => {
      if (!chatOpen) {
        const path = window.location.pathname;
        setBubble(path.startsWith("/posts/") ? "在看这篇文章呢～有问题问我！" : bubbles[Math.floor(Math.random() * bubbles.length)]);
        setTimeout(() => setBubble(""), 4000);
      }
    }, 3000);
    const timer = setInterval(() => {
      if (chatOpen) return;
      setBubble(bubbles[Math.floor(Math.random() * bubbles.length)]);
      setTimeout(() => setBubble(""), 4000);
    }, 15000);
    return () => { clearTimeout(t0); clearInterval(timer); };
  }, [chatOpen, initialized]);

  // Drag
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (chatOpen) return;
    e.preventDefault();
    dragging.current = true;
    dragDist.current = 0;
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [chatOpen]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    dragDist.current += Math.abs(e.movementX) + Math.abs(e.movementY);
    setPos({
      x: Math.min(Math.max(e.clientX - dragOffset.current.x, 0), window.innerWidth - PET_SIZE),
      y: Math.min(Math.max(e.clientY - dragOffset.current.y, 48), window.innerHeight - PET_SIZE),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    try { localStorage.setItem(POS_KEY, JSON.stringify(posRef.current)); } catch { /* ignore */ }
  }, []);

  // Click → chat (if enabled)
  const chatEnabled = process.env.NEXT_PUBLIC_ENABLE_PET_CHAT !== "false";
  const onClick = useCallback(() => {
    if (!chatEnabled || dragDist.current > 8) return;
    setChatOpen(true);
    setBubble("");
  }, [chatEnabled]);

  // Send chat
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    setChatLoading(true);
    const updated: ChatMsg[] = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(updated);

    try {
      const pathname = window.location.pathname;
      const postSlug = pathname.startsWith("/posts/") ? pathname.split("/posts/")[1] : null;
      const body: Record<string, unknown> = { message: msg };
      if (postSlug) {
        const res = await fetch(`/api/posts?slug=${encodeURIComponent(postSlug)}&limit=1`);
        const data = await res.json();
        if (data.posts?.[0]?.id) body.context = { postId: data.posts[0].id };
      }

      const apiRes = await fetch("/api/pet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!apiRes.ok) throw new Error("API error");
      const reader = apiRes.body?.getReader();
      if (!reader) throw new Error("No stream");

      let full = ""; const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setStreaming(full);
      }
      const html = full
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent-secondary);text-decoration:underline">$1</a>')
        .replace(/\n/g, "<br/>");
      setChatMessages([...updated, { role: "assistant", content: html }]);
    } catch {
      setChatMessages([...updated, { role: "assistant", content: "呜... 卷卷不在家 (＞﹏＜)" }]);
    }
    setStreaming("");
    setChatLoading(false);
  }

  if (!initialized) return null;

  return (
    <>
      {/* Pet */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        title="卷卷 - 拖拽移动 | 点击聊天"
        className="fixed select-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: PET_SIZE,
          height: PET_SIZE,
          zIndex: 99999,
          cursor: "pointer",
          touchAction: "none",
        }}
      >
        {bubble && !chatOpen && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="px-3 py-1.5 rounded-xl text-xs shadow-lg animate-fade-in"
              style={{ background: "var(--bg-overlay)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
              {bubble}
            </div>
          </div>
        )}
        <PetSprite animation="idle" size={PET_SIZE} />
      </div>

      {/* Chat panel */}
      {chatEnabled && chatOpen && (
        <div
          className="fixed rounded-xl flex flex-col shadow-2xl animate-fade-in-up"
          style={{ left: "max(30px, 2vw)", right: "max(30px, 2vw)", bottom: 30, maxWidth: 360, maxHeight: "70vh", zIndex: 99999,
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>卷卷</span>
            <div className="flex gap-2">
              <button onClick={() => { setChatMessages([]); localStorage.removeItem(CHAT_KEY); }}
                className="text-xs px-2 py-0.5 rounded" style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>清空</button>
              <button onClick={() => setChatOpen(false)} style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" style={{ maxHeight: "calc(70vh - 120px)" }}>
            {chatMessages.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
                卷卷可以帮你搜索文章、讲解内容～<br/>试试问「有没有 React 的文章」(´▽`ʃ♡ƪ)
              </p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : ""}>
                <span className="inline-block px-2.5 py-1.5 rounded-xl text-xs max-w-[82%]"
                  style={{ background: m.role === "user" ? "var(--accent-glow)" : "var(--bg-elevated)", color: "var(--text-primary)" }}>
                  {m.role === "assistant" && m.content.includes("<a ")
                    ? <span dangerouslySetInnerHTML={{ __html: m.content }} />
                    : m.content}
                </span>
              </div>
            ))}
            {streaming && (
              <div>
                <span className="inline-block px-2.5 py-1.5 rounded-xl text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                  <span dangerouslySetInnerHTML={{
                    __html: streaming
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent-secondary);text-decoration:underline">$1</a>')
                      .replace(/\n/g, "<br/>")
                  }} />
                  <span className="ai-cursor" />
                </span>
              </div>
            )}
            {chatLoading && !streaming && <div className="text-xs" style={{ color: "var(--text-muted)" }}>思考中...</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 p-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="问卷卷..."
              className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            <button type="submit" disabled={chatLoading || !chatInput.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
              style={{ background: "var(--accent-primary)", color: "#fff" }}>发送</button>
          </form>
        </div>
      )}
    </>
  );
}
