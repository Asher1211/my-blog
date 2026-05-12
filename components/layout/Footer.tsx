export default function Footer() {
  return (
    <footer
      className="border-t py-10 mt-20"
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="max-w-content mx-auto px-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
        <p>数字档案馆 &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">用光影记录学习的轨迹</p>
      </div>
    </footer>
  );
}
