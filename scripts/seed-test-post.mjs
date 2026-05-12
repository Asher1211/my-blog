import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found. Please create an admin user first.");
    return;
  }

  const post = await prisma.post.create({
    data: {
      title: "React Hooks 深入理解",
      slug: "react-hooks-deep-dive",
      content: `## React Hooks 核心概念

React Hooks 是 React 16.8 引入的特性，让函数组件也能使用状态和生命周期。

### useState

\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`

### useEffect

\`\`\`tsx
useEffect(() => {
  document.title = "Count: " + count;
}, [count]);
\`\`\`

### 自定义 Hook

> 自定义 Hook 是复用状态逻辑的最佳方式。每个 hook 都有独立的状态。

- 函数名必须以 \`use\` 开头
- 可以调用其他 Hooks
- 每次调用创建独立状态

数学公式示例：

$$E = mc^2$$

这是一段 **粗体** 和 *斜体* 以及 \`inline code\` 的混合文本。
      `,
      excerpt: "深入理解 React Hooks 的设计思想与使用技巧",
      published: true,
      publishedAt: new Date(),
      wordCount: 220,
      readingTime: 2,
      authorId: user.id,
    },
  });

  console.log("文章已创建:", post.title);
  console.log("slug:", post.slug);

  const count = await prisma.post.count();
  console.log("总文章数:", count);

  await prisma.$disconnect();
}

main().catch(console.error);
