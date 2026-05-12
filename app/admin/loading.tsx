export default function AdminLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
      <div className="h-9 w-32 rounded mb-6" style={{ background: "var(--bg-elevated)" }} />
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-8 w-12 rounded mx-auto mb-1" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-3 w-12 rounded mx-auto" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
