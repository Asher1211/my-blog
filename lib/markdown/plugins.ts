import type { Element, Root } from "hast";
import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";
import { createHighlighter, type BundledLanguage } from "shiki";

let highlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null;

async function getHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["github-dark"],
      langs: [
        "typescript", "javascript", "tsx", "jsx", "css", "html",
        "python", "rust", "go", "java", "c", "cpp", "csharp",
        "bash", "shell", "json", "yaml", "markdown", "sql",
        "graphql", "prisma", "dockerfile",
      ],
    });
  }
  return highlighter;
}

export function rehypeShiki() {
  return async (tree: Root) => {
    const hl = await getHighlighter();
    const nodes: { node: Element; lang: string; code: string }[] = [];

    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;
      const codeNode = node.children[0] as Element | undefined;
      if (!codeNode || codeNode.tagName !== "code") return;

      const className = Array.isArray(codeNode.properties?.className)
        ? (codeNode.properties.className as (string | number)[])
        : [];

      const langClass = className
        .find((c) => String(c).startsWith("language-"))
        ?.toString()
        .replace("language-", "");

      const lang = langClass || "text";
      const code = codeNode.children
        .filter((c): c is { type: "text"; value: string } => c.type === "text")
        .map((c) => c.value)
        .join("");

      nodes.push({ node, lang, code });
    });

    for (const { node, lang, code } of nodes) {
      const html = hl.codeToHtml(code, {
        lang: lang as BundledLanguage,
        theme: "github-dark",
      });

      const hast = fromHtml(html, { fragment: true });
      const preElement = hast.children[0] as Element | undefined;

      if (preElement && preElement.tagName === "pre") {
        node.children = preElement.children;
        node.properties = { ...node.properties, ...preElement.properties };
      }
    }
  };
}
