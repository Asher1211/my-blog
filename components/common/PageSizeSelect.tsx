"use client";

interface Props {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}

export default function PageSizeSelect({ value, options, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-xs px-2 py-1.5 rounded-lg focus:outline-none"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
    >
      {options.map((n) => (
        <option key={n} value={n}>{n} 篇/页</option>
      ))}
    </select>
  );
}
