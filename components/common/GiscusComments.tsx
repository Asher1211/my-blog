"use client";

import { useEffect, useRef } from "react";

function loadGiscus(container: HTMLElement) {
  container.innerHTML = "";

  const isLight = document.documentElement.classList.contains("light");
  const theme = isLight ? "light" : "dark_dimmed";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", "Asher1211/my-blog");
  script.setAttribute("data-repo-id", "R_kgDOSbS3sA");
  script.setAttribute("data-category", "Announcements");
  script.setAttribute("data-category-id", "DIC_kwDOSbS3sM4C85WR");
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", theme);
  script.setAttribute("data-lang", "zh-CN");
  script.crossOrigin = "anonymous";
  container.appendChild(script);
}

export default function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    loadGiscus(container);

    // Watch for theme changes and reload
    const observer = new MutationObserver(() => {
      loadGiscus(container);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="mt-16" style={{ minHeight: 200 }} />;
}
