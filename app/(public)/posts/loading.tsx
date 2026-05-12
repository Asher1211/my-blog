export default function PostsLoading() {
  return (
    <div className="max-w-content mx-auto px-6 py-12 animate-fade-in">
      <div className="h-9 w-32 rounded mb-6" style={{ background: "var(--bg-elevated)" }} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl p-6 animate-shimmer" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-4 w-24 rounded mb-3" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-6 w-3/4 rounded mb-2" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-4 w-full rounded" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
