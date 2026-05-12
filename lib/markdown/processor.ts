import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { rehypeShiki } from "./plugins";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes?.code || []), ["className"]],
      span: [...(defaultSchema.attributes?.span || []), ["className"], ["style"]],
      div: [...(defaultSchema.attributes?.div || []), ["className"], ["style"]],
    },
  })
  .use(rehypeShiki)
  .use(rehypeStringify);

export async function processMarkdown(content: string): Promise<string> {
  const result = await processor.process(content);
  return String(result);
}

export { processor };
