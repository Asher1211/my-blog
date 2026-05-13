"use client";

import { useEffect, useState } from "react";

export default function GitHubStar() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Re-render iframe when theme changes
    const observer = new MutationObserver(() => {
      setKey((k) => k + 1);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const isLight = typeof document !== "undefined" && document.documentElement.classList.contains("light");
  const colorScheme = isLight ? "" : "&color-scheme=dark_dimmed";

  return (
    <iframe
      key={key}
      src={`https://ghbtns.com/github-btn.html?user=Asher1211&repo=my-blog&type=star&count=true&size=small${colorScheme}`}
      frameBorder="0"
      scrolling="0"
      width="90"
      height="20"
      title="GitHub Star"
      style={{ marginTop: 2 }}
    />
  );
}
