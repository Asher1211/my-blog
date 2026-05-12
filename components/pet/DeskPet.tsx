"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import PetSprite from "./PetSprite";
import type { PetAnimation } from "./PetSprite";

interface ChatMsg { role: "user" | "assistant"; content: string; }

const CHAT_KEY = "pet-chat-history";
const POS_KEY = "pet-position-v4";
const PET_SIZE = 80;

export default function DeskPet() {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const [anim, setAnim] = useState<PetAnimation>("idle");
  const [facingLeft, setFacingLeft] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [bubble, setBubble] = useState("");

  const posRef = useRef(pos); posRef.current = pos;
  const animRef = useRef(anim); animRef.current = anim;
  const chatOpenRef = useRef(chatOpen); chatOpenRef.current = chatOpen;
  const draggedRef = useRef(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragDist = useRef(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Wander state
  const targetRef = useRef({ x: 100, y: 100 });
  const wanderTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isWanderingRef = useRef(false);

  // Init
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
    targetRef.current = savedPos;
    setInitialized(true);
  }, []);

  // Save chat
  useEffect(() => {
    if (chatMessages.length) {
      try { localStorage.setItem(CHAT_KEY, JSON.stringify(chatMessages)); } catch { /* ignore */ }
    }
  }, [chatMessages]);

  // Scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, streaming]);

  // Idle bubbles
  useEffect(() => {
    if (!initialized) return;
    const bubbles = ["点我可以聊天哦 (´ω`)", "有什么可以帮你？", "想找文章吗？问我！", "你好呀～我是卷卷"];
    const t0 = setTimeout(() => {
      if (!chatOpenRef.current) {
        const path = window.location.pathname;
        setBubble(path.startsWith("/posts/") ? "在看这篇文章呢～有问题问我！" : bubbles[Math.floor(Math.random() * bubbles.length)]);
        setTimeout(() => setBubble(""), 4000);
      }
    }, 3000);
    const timer = setInterval(() => {
      if (chatOpenRef.current) return;
      setBubble(bubbles[Math.floor(Math.random() * bubbles.length)]);
      setTimeout(() => setBubble(""), 4000);
    }, 15000);
    return () => { clearTimeout(t0); clearInterval(timer); };
  }, [initialized]);

  // Random wandering
  useEffect(() => {
    if (!initialized) return;

    function startWander() {
      if (dragging.current || chatOpenRef.current) return;
      if (isWanderingRef.current) return;
      isWanderingRef.current = true;

      const w = window.innerWidth - PET_SIZE;
      const h = window.innerHeight - PET_SIZE;
      const tx = Math.random() * w;
      const ty = 48 + Math.random() * (h - 48);
      targetRef.current = { x: tx, y: ty };

      // Face direction
      setFacingLeft(tx < posRef.current.x);
      setAnim("walk");

      // Stop wandering after reaching destination or timeout
      const stopWander = () => {
        isWanderingRef.current = false;
        if (!dragging.current && !chatOpenRef.current) setAnim("idle");
      };

      // Check arrival
      const checkArrival = setInterval(() => {
        if (!isWanderingRef.current) { clearInterval(checkArrival); return; }
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < 2) {
          clearInterval(checkArrival);
          stopWander();
        }
      }, 100);

      // Timeout after 8 seconds max
      setTimeout(() => { clearInterval(checkArrival); stopWander(); }, 8000);
    }

    function scheduleNext() {
      wanderTimerRef.current = setTimeout(() => {
        startWander();
        scheduleNext();
      }, 8000 + Math.random() * 12000); // wander every 8-20 seconds
    }

    scheduleNext();

    return () => { if (wanderTimerRef.current) clearTimeout(wanderTimerRef.current); };
  }, [initialized]);

  // Movement loop (smooth walk toward target)
  useEffect(() => {
    if (!initialized) return;

    let running = true;
    function loop() {
      if (!running) return;
      if (dragging.current || chatOpenRef.current) { requestAnimationFrame(loop); return; }

      if (isWanderingRef.current) {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.5) {
          const speed = 1.2;
          const nx = posRef.current.x + (dx / dist) * speed;
          const ny = posRef.current.y + (dy / dist) * speed;
          setPos({ x: nx, y: ny });
          setFacingLeft(dx < 0);
        }
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return () => { running = false; };
  }, [initialized]);

  // Drag
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (chatOpen) return;
    e.preventDefault();
    dragging.current = true;
    draggedRef.current = false;
    dragDist.current = 0;
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setAnim("walk");
  }, [chatOpen]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    draggedRef.current = true;
    dragDist.current += Math.abs(e.movementX) + Math.abs(e.movementY);
    const nx = e.clientX - dragOffset.current.x;
    const ny = e.clientY - dragOffset.current.y;
    setFacingLeft(e.movementX < 0);
    setPos({
      x: Math.min(Math.max(nx, 0), window.innerWidth - PET_SIZE),
      y: Math.min(Math.max(ny, 48), window.innerHeight - PET_SIZE),
    });
    targetRef.current = { x: nx, y: ny };
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    setAnim("idle");
    isWanderingRef.current = false;
    try { localStorage.setItem(POS_KEY, JSON.stringify(posRef.current)); } catch { /* ignore */ }
  }, []);

  const onClick = useCallback(() => {
    if (dragDist.current > 8) return;
    setChatOpen(true);
    setAnim("chat");
    setBubble("");
  }, []);

  // Chat
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
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={onClick}
        title="卷卷 - 拖拽移动 | 点击聊天"
        className="fixed select-none"
        style={{
          left: `${pos.x}px`, top: `${pos.y}px`,
          width: PET_SIZE, height: PET_SIZE,
          zIndex: 99999, cursor: "pointer", touchAction: "none",
        }}
      >
        {bubble && !chatOpen && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ transform: `translateX(-50%)${facingLeft ? " scaleX(-1)" : ""}` }}>
            <div className="px-3 py-1.5 rounded-xl text-xs shadow-lg animate-fade-in"
              style={{ background: "var(--bg-overlay)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}>
              {bubble}
            </div>
          </div>
        )}
        <PetSprite animation={anim} size={PET_SIZE} facingLeft={facingLeft} />
      </div>

      {chatOpen && (
        <div className="fixed rounded-xl flex flex-col shadow-2xl animate-fade-in-up"
          style={{ left: 30, bottom: 30, width: 340, maxHeight: "70vh", zIndex: 99999,
            background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>卷卷</span>
            <div className="flex gap-2">
              <button onClick={() => { setChatMessages([]); localStorage.removeItem(CHAT_KEY); }}
                className="text-xs px-2 py-0.5 rounded" style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>清空</button>
              <button onClick={() => { setChatOpen(false); setAnim("idle"); }} style={{ color: "var(--text-muted)" }}>✕</button>
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
                  {m.role === "assistant" && m.content.includes("<a ") ? <span dangerouslySetInnerHTML={{ __html: m.content }} /> : m.content}
                </span>
              </div>
            ))}
            {streaming && (
              <div>
                <span className="inline-block px-2.5 py-1.5 rounded-xl text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                  <span dangerouslySetInnerHTML={{
                    __html: streaming
                      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent-secondary);text-decoration:underline">$1</a>')
                      .replace(/\n/g, "<br/>") }} />
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
