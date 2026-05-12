"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  options: number[];
}

export default function PageSizeSelect({ options }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", String(value));
    params.delete("page"); // reset to page 1
    router.push(`${pathname}?${params.toString()}`);
  }

  const currentLimit = Number(searchParams.get("limit")) || options[0];

  return (
    <select
      value={currentLimit}
      onChange={(e) => handleChange(Number(e.target.value))}
      className="text-xs px-2 py-1.5 rounded-lg focus:outline-none"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
    >
      {options.map((n) => (
        <option key={n} value={n}>{n} 篇/页</option>
      ))}
    </select>
  );
}
