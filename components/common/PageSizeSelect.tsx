"use client";

import { useRouter, usePathname } from "next/navigation";

interface Props {
  options: number[];
  current: number;
}

export default function PageSizeSelect({ options, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={current}
      onChange={(e) => {
        const url = new URL(window.location.href);
        url.searchParams.set("limit", e.target.value);
        url.searchParams.delete("page");
        router.push(pathname + url.search);
      }}
      className="text-xs px-2 py-1.5 rounded-lg focus:outline-none"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
    >
      {options.map((n) => (
        <option key={n} value={n}>{n} 篇/页</option>
      ))}
    </select>
  );
}
