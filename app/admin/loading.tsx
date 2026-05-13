export default function AdminLoading() {
  return (
    <div className="flex animate-fade-in">
      {/* Sidebar skeleton */}
      <aside className="hidden md:block w-52 shrink-0" style={{ borderRight: "1px solid var(--border-subtle)" }}>
        <div className="p-4 space-y-2 pt-20">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 rounded-lg" style={{ background: "var(--bg-elevated)" }} />
          ))}
        </div>
      </aside>

      {/* Content skeleton */}
      <div className="flex-1 px-6 py-8">
        <div className="h-8 w-32 rounded mb-6" style={{ background: "var(--bg-elevated)" }} />
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <div className="h-8 w-10 mx-auto mb-1 rounded" style={{ background: "var(--bg-elevated)" }} />
              <div className="h-3 w-8 mx-auto rounded" style={{ background: "var(--bg-elevated)" }} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
              <div className="h-5 w-1/2 rounded mb-2" style={{ background: "var(--bg-elevated)" }} />
              <div className="h-3 w-64 rounded" style={{ background: "var(--bg-elevated)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
