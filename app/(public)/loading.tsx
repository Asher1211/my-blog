export default function HomeLoading() {
  return (
    <div className="max-w-content mx-auto px-6 pb-16 animate-fade-in">
      {/* Hero skeleton */}
      <section className="py-20 md:py-32 text-center">
        <div className="h-16 w-72 rounded mx-auto mb-4" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-6 w-56 rounded mx-auto mt-6" style={{ background: "var(--bg-elevated)" }} />
        <div className="flex justify-center gap-4 mt-8">
          <div className="h-11 w-28 rounded-full" style={{ background: "var(--bg-elevated)" }} />
          <div className="h-11 w-28 rounded-full" style={{ background: "var(--bg-elevated)" }} />
        </div>
      </section>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="h-8 w-10 rounded mx-auto mb-2" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-3 w-8 rounded mx-auto" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>

      {/* Posts grid skeleton */}
      <div className="h-8 w-32 rounded mb-6" style={{ background: "var(--bg-elevated)" }} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl p-6 animate-shimmer" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex gap-3 mb-3">
              <div className="h-3 w-20 rounded" style={{ background: "var(--bg-elevated)" }} />
              <div className="h-3 w-12 rounded" style={{ background: "var(--bg-elevated)" }} />
            </div>
            <div className="h-6 w-3/4 rounded mb-2" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-4 w-full rounded" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
