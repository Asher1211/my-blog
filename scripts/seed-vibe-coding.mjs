import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin ---
  const hash = await bcrypt.hash("123456", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@blog.com" },
    update: {},
    create: { email: "admin@blog.com", name: "博主", role: "ADMIN", password: hash },
  });

  // --- Categories ---
  const cats = await Promise.all([
    prisma.category.upsert({ where: { name: "Vibe Coding" }, create: { name: "Vibe Coding", slug: "vibe-coding", color: "#d4a854" }, update: {} }),
    prisma.category.upsert({ where: { name: "工具踩坑" }, create: { name: "工具踩坑", slug: "tools-debug", color: "#5b9bd5" }, update: {} }),
    prisma.category.upsert({ where: { name: "项目实战" }, create: { name: "项目实战", slug: "project", color: "#e05555" }, update: {} }),
  ]);

  // --- Tags ---
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { name: "Vibe Coding" }, create: { name: "Vibe Coding", slug: "vibe-coding" }, update: {} }),
    prisma.tag.upsert({ where: { name: "AI 编程" }, create: { name: "AI 编程", slug: "ai-coding" }, update: {} }),
    prisma.tag.upsert({ where: { name: "DeepSeek" }, create: { name: "DeepSeek", slug: "deepseek" }, update: {} }),
    prisma.tag.upsert({ where: { name: "Claude Code" }, create: { name: "Claude Code", slug: "claude-code" }, update: {} }),
    prisma.tag.upsert({ where: { name: "Next.js" }, create: { name: "Next.js", slug: "nextjs" }, update: {} }),
    prisma.tag.upsert({ where: { name: "PostgreSQL" }, create: { name: "PostgreSQL", slug: "postgresql" }, update: {} }),
    prisma.tag.upsert({ where: { name: "Prisma" }, create: { name: "Prisma", slug: "prisma" }, update: {} }),
    prisma.tag.upsert({ where: { name: "Neon" }, create: { name: "Neon", slug: "neon" }, update: {} }),
    prisma.tag.upsert({ where: { name: "Tailwind CSS" }, create: { name: "Tailwind CSS", slug: "tailwind" }, update: {} }),
    prisma.tag.upsert({ where: { name: "桌宠" }, create: { name: "桌宠", slug: "desk-pet" }, update: {} }),
    prisma.tag.upsert({ where: { name: "部署" }, create: { name: "部署", slug: "deploy" }, update: {} }),
  ]);

  const tag = (name) => tags.find((t) => t.name === name);

  // --- Posts ---
  const posts = [
    {
      title: "Vibe Coding 初体验：从零开始用 AI 写博客",
      slug: "vibe-coding-first-experience",
      excerpt: "记录我第一次尝试 Vibe Coding，用 DeepSeek 和 Claude Code 从零搭建这个博客的全过程。",
      category: cats[0].id,
      tags: [tag("Vibe Coding"), tag("AI 编程"), tag("DeepSeek"), tag("Claude Code"), tag("Next.js")],
      content: `## 什么是 Vibe Coding

Vibe Coding 是一种全新的编程范式——你不需要一行一行写代码，而是用自然语言告诉 AI 你想要什么，AI 帮你实现。

我决定用这种方式来搭建我的个人博客，记录这个实验的完整过程。

### 技术选型

和 AI 讨论后，确定的技术栈：

- **Next.js 14** — 前后端一体，App Router 路由
- **PostgreSQL + Prisma** — 数据库和 ORM
- **Neon** — 免费的 Serverless Postgres
- **Tailwind CSS** — 原子化样式
- **DeepSeek API** — AI 对话和文章搜索

### 开发流程

\`\`\`bash
# 第一步：让 AI 初始化项目
npx create-next-app@14 my-blog --typescript --tailwind --app

# 第二步：AI 帮我写 Prisma Schema
# 第三步：AI 帮我搭 API 路由
# 第四步：AI 帮我写前端页面
\`\`\`

整个过程我只需要描述需求、确认方案、测试功能，具体代码全是 AI 写的。

### 心得

> Vibe Coding 的核心不是偷懒，而是把精力聚焦在"做什么"而不是"怎么做"。

刚开始有点不习惯，但适应后发现效率惊人。一个完整的博客系统（前后台 + AI 对话 + 桌宠），传统开发至少 2-3 周，我只用了不到一周。`,
    },
    {
      title: "Neon PostgreSQL 国内连接踩坑记",
      slug: "neon-postgres-china-connection",
      excerpt: "Neon 免费数据库很好用，但从国内连接美国节点延迟 3 秒，迁移到新加坡后降到 240ms。",
      category: cats[1].id,
      tags: [tag("PostgreSQL"), tag("Neon"), tag("Prisma")],
      content: `## 问题

博客开发完成后，发现页面加载特别慢，点一个按钮要等 3 秒。

### 排查

打开 Chrome DevTools，瀑布图显示每个页面请求都在 2-3 秒。

\`\`\`bash
# 测试数据库延迟
curl -s -w "%{time_total}s" http://localhost:3000
# 输出：3.011s
\`\`\`

问题不在代码——是数据库延迟。Neon 默认创建在 **US East (N. Virginia)**，我在中国，每个 SQL 查询走太平洋往返 200-300ms，首页 4 个并行查询加起来就 2-3 秒。

### 解决方案

1. 在 Neon 控制台创建新 Project
2. Region 选 **AWS Asia Pacific (Singapore)**
3. 复制新的连接字符串
4. 更新 \`.env\` 中的 \`DATABASE_URL\`
5. \`prisma db push\` 重建表结构

### 结果

\`\`\`bash
curl -s -w "%{time_total}s" http://localhost:3000
# 输出：0.241s  ← 快了 12 倍！
\`\`\`

### 教训

> 选云服务时一定要看 Region。免费归免费，物理距离没法压缩。

另外 Neon 的 **Pooled connection**（连接池端点）对 Serverless 环境更友好，连接字符串里带 \`-pooler\` 就是池化连接。`,
    },
    {
      title: "给博客加一个二次元桌宠：从 emoji 到序列帧",
      slug: "adding-anime-desk-pet",
      excerpt: "记录博客桌宠系统的完整开发过程：状态机设计、Canvas 渲染、序列帧加载、拖拽和对话功能。",
      category: cats[0].id,
      tags: [tag("Vibe Coding"), tag("桌宠"), tag("Claude Code")],
      content: `## 为什么要做桌宠

博客需要一个"灵魂"。右下角的小助手不仅能回答问题，还让整个网站有了温度。

### 第一版：emoji 小猫 🐱

最早用了一个 \`🐱\` emoji 放在右下角：

\`\`\`tsx
<div className="fixed rounded-full" style={{ right: 24, bottom: 24 }}>
  🐱
</div>
\`\`\`

太简陋了，只有一个图标，没有动画也没有交互感。

### 第二版：Canvas 程序化绘制

用 Canvas API 画了一个二次元少女：

- 🎀 双马尾 + 呆毛
- 👀 会眨眼的大眼睛
- 👗 粉色连衣裙
- 支持 idle/walk/chat/sleep/excited 五个动画状态

问题：程序化绘制虽然能动，但画风太简陋，不够精致。

### 第三版：序列帧精灵图

最终方案是 Canvas 加载序列帧 PNG：

\`\`\`ts
// 精灵图配置
const SPRITE_MAP = {
  idle: { src: "/pet/idle.png", frames: 9, fps: 18 },
  walk: { src: "/pet/walk.png", frames: 4, fps: 8 },
};
\`\`\`

### 桌宠的状态机

\`\`\`ts
type PetState = "idle" | "walk" | "chat" | "sleep" | "excited";
\`\`\`

- **idle**: 待机呼吸动画
- **chat**: 点击桌宠弹出聊天窗口
- **walk**: 拖拽时播放行走动画

### 技术要点

1. **Canvas 序列帧渲染**：\`requestAnimationFrame\` 循环，按帧率切分精灵图
2. **拖拽**：Pointer Events + \`touch-action: none\` 阻止浏览器滚动
3. **AI 对话**：DeepSeek API 流式返回，卷卷人格提示词
4. **位置持久化**：localStorage 保存坐标

### 下一步

计划找更精致的二次元精灵图素材，替换现在的程序化角色。`,
    },
    {
      title: "DeepSeek API 接入实战：博客 AI 助手的完整方案",
      slug: "deepseek-api-integration",
      excerpt: "用 DeepSeek Chat API 给博客加上文章内 AI 对话和跨文章搜索，完整的接口封装和前端实现。",
      category: cats[0].id,
      tags: [tag("DeepSeek"), tag("AI 编程"), tag("Vibe Coding")],
      content: `## 为什么选 DeepSeek

DeepSeek API 有几个优势：

1. **价格便宜** — 比 Claude/OpenAI 便宜很多
2. **中文能力强** — 国产模型，中文理解和生成都很好
3. **OpenAI 兼容** — 直接复用 OpenAI SDK

### 封装 API 客户端

\`\`\`ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function streamChat(params: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  onChunk: (text: string) => void;
}) {
  const stream = await client.chat.completions.create({
    model: "deepseek-chat",
    stream: true,
    max_tokens: 2048,
    messages: [
      { role: "system", content: params.systemPrompt },
      ...params.messages,
    ],
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) params.onChunk(delta);
  }
}
\`\`\`

### 两种 AI 功能

#### 1. 文章内 AI 对话

卷卷读取当前文章全文，基于文章内容回答问题：

- System Prompt 携带文章标题、标签、完整 Markdown 内容
- 流式返回，前端逐字渲染
- 提示词约束："优先引用原文"、"超出范围须注明"

#### 2. 跨文章搜索

用户用自然语言描述需求，AI 扫描全站文章并推荐：

- 卷卷判断用户意图（关键词匹配：搜/找/有没有）
- 从数据库获取所有已发布文章
- 拼接成搜索提示词发给 DeepSeek
- 返回 Markdown 链接格式，前端转换为可点击 HTML

### System Prompt 设计

\`\`\`ts
export function buildArticleChatPrompt(article) {
  return \`你是博主的学习助手...

【当前文章】
标题：\${article.title}
内容：\${article.content}

【你的职责】
1. 基于文章内容回答问题，优先引用原文
2. 超出范围须注明"文章未涉及"
3. 回答使用中文，简洁专业
4. 不要编造内容\`;
}
\`\`\`

### 前后端通信

\`\`\`
前端  → POST /api/ai/chat { postId, question, history }
后端  → 读取文章 → 构建 Prompt → DeepSeek stream
前端  ← SSE 流式文本 → 逐字渲染
\`\`\`

### 踩坑记录

1. **Edge Runtime 不支持 bcryptjs**：拆分 \`auth.config.ts\` 和 \`auth.ts\`，middleware 只用纯 JWT 配置
2. **流式响应处理**：用 ReadableStream + TextDecoder，注意处理 UTF-8 多字节字符
3. **Markdown 链接转换**：AI 返回的 \`[标题](/path)\` 需要用正则转成 \`<a>\` 标签`,
    },
    {
      title: "从 NextAuth v4 到 v5：认证升级的血泪史",
      slug: "nextauth-v4-to-v5-migration",
      excerpt: "NextAuth v5 是 beta 版本，升级过程中遇到了 API 变更、Edge Runtime 兼容、类型定义等一堆坑。",
      category: cats[1].id,
      tags: [tag("Next.js"), tag("AI 编程"), tag("Claude Code")],
      content: `## 背景

博客的认证系统需要保护后台管理页面。NextAuth 是最流行的 Next.js 认证库。

v5（beta）相比 v4 有重大 API 变更：

### API 变化

\`\`\`ts
// v4
import NextAuth from "next-auth";
export default NextAuth({ providers: [...] });

// v5
import NextAuth from "next-auth";
export const { handlers, auth, signIn, signOut } = NextAuth({ providers: [...] });
\`\`\`

v5 导出的是命名导出 \`{ handlers, auth, signIn, signOut }\`，不再像 v4 一样 export default。

### Edge Runtime 问题

最大的坑：middleware 在 Edge Runtime 运行，不能导入 Node.js 模块。

\`\`\`ts
// ❌ middleware 导入 auth.ts → auth.ts 导入 bcryptjs
// bcryptjs 依赖 Node.js crypto 模块，Edge Runtime 不兼容

// ✅ 解决方案：拆分配置
// auth.config.ts — 纯 JWT 配置，无 providers
// auth.ts — 完整配置，包含 Credentials provider
// middleware.ts → 只导入 auth.config.ts
\`\`\`

### Session 类型扩展

\`\`\`ts
// types/next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: { id: string; role: string } & DefaultSession["user"];
  }
}
\`\`\`

### Credentials Provider

只用邮箱+密码登录，不接 GitHub OAuth：

\`\`\`ts
Credentials({
  async authorize(credentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });
    if (!user?.password) return null;
    const valid = await bcrypt.compare(credentials.password, user.password);
    return valid ? user : null;
  },
})
\`\`\`

### 中间件路由保护

\`\`\`ts
// middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = { matcher: ["/admin/:path*"] };
\`\`\`

未登录访问 \`/admin/**\` 自动重定向到 \`/login\`。

### 登录页面

v5 支持 Server Actions 和 Client Components 两种方式。最后用了客户端方案——更灵活的错误处理和 loading 状态：

\`\`\`tsx
const result = await signIn("credentials", {
  email, password, redirect: false,
});
if (result?.error) setError("邮箱或密码错误");
else router.push(callbackUrl);
\`\`\`

### 总结

v5 虽然还是 beta，但架构更清晰（函数式 API、Edge 兼容）。升级过程中遇到的问题大多是 Edge Runtime 限制导致的，理解了这个核心概念后就迎刃而解了。`,
    },
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        categoryId: p.category,
        published: true,
        publishedAt: new Date(),
        wordCount: p.content.length,
        readingTime: Math.ceil(p.content.length / 200),
        authorId: user.id,
      },
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.excerpt,
        categoryId: p.category,
        published: true,
        publishedAt: new Date(),
        wordCount: p.content.length,
        readingTime: Math.ceil(p.content.length / 200),
        authorId: user.id,
      },
    });

    // Link tags
    const post = await prisma.post.findUnique({ where: { slug: p.slug } });
    if (post) {
      await prisma.tagsOnPosts.deleteMany({ where: { postId: post.id } });
      if (p.tags.length > 0) {
        await prisma.tagsOnPosts.createMany({
          data: p.tags.map((t) => ({ postId: post.id, tagId: t.id })),
        });
      }
    }

    console.log(`✓ ${p.title}`);
  }

  console.log("\nDone! 5 articles seeded.");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
