export default function AdminPostsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex justify-between mb-6">
        <div className="h-9 w-40 rounded" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-9 w-24 rounded" style={{ background: "var(--bg-elevated)" }} />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl p-4 animate-shimmer" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-5 w-1/2 rounded mb-2" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-3 w-64 rounded" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
