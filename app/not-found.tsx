import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-8xl mb-4" style={{ color: "var(--accent-primary)" }}>404</h1>
        <p className="text-lg mb-2" style={{ color: "var(--text-primary)" }}>页面未找到</p>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>这卷胶片还没有曝光...</p>
        <div className="flex justify-center gap-4">
          <Link href="/" className="px-6 py-2.5 rounded-full text-sm font-medium"
            style={{ background: "var(--accent-primary)", color: "#fff" }}>
            返回首页
          </Link>
          <Link href="/posts" className="px-6 py-2.5 rounded-full text-sm font-medium"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            浏览文章
          </Link>
        </div>
      </div>
    </div>
  );
}
