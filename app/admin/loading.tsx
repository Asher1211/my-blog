export default function AdminLoading() {
  return (
    <div className="fixed top-16 left-0 right-0 z-50">
      <div
        className="h-0.5 animate-pulse w-full"
        style={{ background: "var(--accent-primary)", opacity: 0.6 }}
      />
    </div>
  );
}
