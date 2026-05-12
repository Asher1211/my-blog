export default function PublicLoading() {
  return (
    <div className="max-w-content mx-auto px-6 py-20 animate-fade-in">
      <div className="text-center mb-16">
        <div className="h-16 w-64 rounded mx-auto mb-4" style={{ background: "var(--bg-elevated)" }} />
        <div className="h-6 w-48 rounded mx-auto" style={{ background: "var(--bg-elevated)" }} />
      </div>
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: "var(--bg-surface)" }}>
            <div className="h-8 w-12 rounded mx-auto mb-2" style={{ background: "var(--bg-elevated)" }} />
            <div className="h-3 w-8 rounded mx-auto" style={{ background: "var(--bg-elevated)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
