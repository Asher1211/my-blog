export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-8" style={{ color: "var(--text-primary)" }}>关于</h1>

      <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <p>
          数字档案馆是一个以学习记录为核心的个人博客。
          这里记录着博主在技术学习路上的思考和积累。
        </p>

        <p>
          每篇文章都像一部胶片，定格那些灵光乍现的时刻。
          希望通过这些记录，能为同样热爱技术的你带来一些启发。
        </p>

        <div className="pt-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <h2 className="font-display text-lg mb-3" style={{ color: "var(--text-primary)" }}>技术栈</h2>
          <ul className="space-y-1" style={{ color: "var(--text-muted)" }}>
            <li>· Next.js 14 + TypeScript</li>
            <li>· PostgreSQL + Prisma</li>
            <li>· Tailwind CSS + Framer Motion</li>
            <li>· DeepSeek AI 驱动</li>
          </ul>
        </div>

        <div className="pt-4">
          <h2 className="font-display text-lg mb-3" style={{ color: "var(--text-primary)" }}>联系方式</h2>
          <p style={{ color: "var(--text-muted)" }}>
            如果你有任何想说的，可以通过卷卷（右下角桌宠）给我留言 :)
          </p>
        </div>
      </div>
    </div>
  );
}
