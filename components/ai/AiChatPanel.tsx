"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  postId: string;
  postTitle: string;
}

export default function AiChatPanel({ postId, postTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  async function send() {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: question }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, question, history }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");

      let fullText = "";
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreaming(fullText);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "AI 暂时无法回复，请稍后重试" }]);
    }

    setStreaming("");
    setLoading(false);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "var(--accent-primary)", color: "#fff" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-16 bottom-0 w-[380px] max-w-[90vw] z-50 flex flex-col"
            style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border-subtle)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>AI 助手</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>基于当前文章内容回答</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: "var(--text-muted)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !loading && (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                  我已读取《{postTitle}》，可以提问了～
                </p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm`} style={{
                    background: msg.role === "user" ? "var(--accent-glow)" : "var(--bg-elevated)",
                    color: "var(--text-primary)",
                  }}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {streaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] px-3 py-2 rounded-lg text-sm" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>
                    <span className="whitespace-pre-wrap">{streaming}</span>
                    <span className="ai-cursor" />
                  </div>
                </div>
              )}
              {loading && !streaming && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-lg text-sm" style={{ color: "var(--text-muted)" }}>思考中...</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="对这篇文章提问..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-3 py-2 rounded-lg text-sm disabled:opacity-40"
                  style={{ background: "var(--accent-primary)", color: "#fff" }}
                >
                  发送
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
