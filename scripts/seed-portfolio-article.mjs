import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst();

  const cat = await prisma.category.upsert({
    where: { name: "项目更新" },
    create: { name: "项目更新", slug: "updates", color: "#a855f7" },
    update: {},
  });

  const t1 = await prisma.tag.upsert({ where: { name: "项目总结" }, create: { name: "项目总结", slug: "project-summary" }, update: {} });
  const t2 = await prisma.tag.upsert({ where: { name: "面试" }, create: { name: "面试", slug: "interview" }, update: {} });
  const t3 = await prisma.tag.upsert({ where: { name: "全栈" }, create: { name: "全栈", slug: "fullstack" }, update: {} });

  const article = {
    title: "简历项目指南：如何用这个博客拿下前端/全栈面试",
    slug: "portfolio-blog-interview-guide",
    excerpt: "从技术选型到架构设计，从性能优化到 AI 集成，全面拆解这个个人博客项目。附带模拟面试问答，帮你把项目经历讲出亮点。",
    content: [
      "## 项目概述",

      "**asher1211.blog** 是一个从零构建的全栈个人技术博客，具备 AI 智能助手、桌面宠物、双主题切换、完整的后台管理系统等能力。独立完成从技术选型、架构设计、数据库建模、前端实现到部署运维的全流程。",

      "> 源码：[github.com/Asher1211/my-blog](https://github.com/Asher1211/my-blog)",
      "> 线上：[asher1211.blog](https://asher1211.blog)",

      "---",

      "## 一、技术栈全景",

      "### 前端",

      "| 技术 | 用途 |",
      "|------|------|",
      "| Next.js 14 (App Router) | SSR/SSG/ISR 混合渲染，API Routes 作为 BFF 层 |",
      "| Tailwind CSS | 原子化样式，CSS 自定义属性实现双主题 |",
      "| Framer Motion | 页面过渡动画、交错列表动画 |",
      "| Canvas API | 桌面宠物精灵图渲染（32×32 帧，3x 缩放） |",

      "### 后端 & 数据",

      "| 技术 | 用途 |",
      "|------|------|",
      "| NextAuth.js v5 | JWT + Credentials 认证，Edge Runtime 兼容 |",
      "| Prisma ORM | 数据库迁移、类型安全查询、多对多关联 |",
      "| PostgreSQL (Neon) | Serverless 数据库，新加坡节点降低国内延迟 |",
      "| DeepSeek Chat API | 流式 AI 对话，SSE 逐字返回 |",

      "### 工程化 & 部署",

      "| 技术 | 用途 |",
      "|------|------|",
      "| Vercel | 自动部署，ISR 缓存 |",
      "| Cloudflare CDN | 国内访问加速，DNS 解析 |",
      "| Giscus | 基于 GitHub Discussions 的评论系统 |",
      "| unified + Shiki | 服务端 Markdown 渲染 + 代码高亮 |",

      "---",

      "## 二、架构设计要点",

      "### 2.1 路由分组与权限隔离",

      "采用 Next.js App Router 的 Route Group 特性：",
      "- `app/(public)/` — 前台博客页面，无需认证",
      "- `app/(admin)/` — 后台管理，通过 middleware 拦截未登录请求",
      "- `app/api/` — API 路由，部分端点通过 `requireAdmin()` 校验 session",

      "```ts",
      "// middleware.ts",
      "export { authConfig as middleware } from \"@/auth.config\";",
      "export const config = { matcher: [\"/admin/:path*\"] };",
      "```",

      "**设计决策**：将 auth.config 与 auth.ts 分离。auth.config.ts 不依赖 Node.js API（如 bcrypt），可在 Edge Runtime 中运行；auth.ts 只在 Node 端使用，引入 Credentials Provider。",

      "### 2.2 混合渲染策略",

      "| 页面类型 | 渲染方式 | 原因 |",
      "|----------|----------|------|",
      "| 文章列表/详情 | ISR (revalidate: 60) | 内容更新不频繁，缓存减轻数据库压力 |",
      "| 时间线页面 | force-dynamic | 需要实时反映文章增删 |",
      "| 后台管理 | CSR + Server Actions | 管理操作需要即时反馈 |",
      "| AI/宠物聊天 | Streaming SSE | 长文本生成需逐字返回 |",

      "### 2.3 双主题系统",

      "基于 CSS 自定义属性实现暗色/亮色切换，无需 JavaScript 计算样式：",

      "```css",
      ":root {",
      "  --bg-base: #0a0a0f;",
      "  --accent-primary: #d4a854;",
      "}",
      ".light {",
      "  --bg-base: #fafaf9;",
      "  --accent-primary: #b8860b;",
      "}",
      "```",

      "所有组件使用 `var(--xxx)` 引用变量，主题切换只需在 `<html>` 上切换 class。Giscus 评论、GitHub Star 按钮等第三方组件通过 MutationObserver 监听主题变化同步切换。",

      "### 2.4 桌面宠物系统",

      '宠物「卷卷」是一个 Canvas 渲染的像素精灵，技术实现：',
      "- **精灵图动画**：单张 PNG 包含所有帧（idle 22f / walk 12f / chat 9f），通过 `drawImage` 裁剪区域逐帧播放",
      "- **状态机**：idle → walk → chat 三个状态，由用户行为事件驱动",
      "- **平滑移动**：requestAnimationFrame 循环，线性插值走向目标位置",
      "- **拖拽**：Pointer Events API + `setPointerCapture`，移动端设置 `touch-action: none` 防滚动冲突",
      "- **持久化**：位置和聊天记录存 localStorage",
      "- **AI 对话**：点击宠物打开聊天面板，调用 DeepSeek API 流式返回",

      "### 2.5 AI 上下文注入",

      "宠物聊天和 AI 面板的核心设计：根据当前页面 URL 动态注入文章上下文到 System Prompt。",

      "```ts",
      "// 前端检测当前页面",
      "const postSlug = pathname.startsWith(\"/posts/\")",
      "  ? pathname.split(\"/posts/\")[1]",
      "  : null;",
      "",
      "// 后端组装 prompt",
      "if (context?.postId) {",
      "  const post = await prisma.post.findUnique({ where: { id: context.postId } });",
      "  systemPrompt = `【读者正在阅读】${post.title}\\n${post.content}\\n基于文章内容回答问题。`;",
      "}",
      "```",

      "读者在文章页与宠物对话时，AI 自动获得全文上下文；在首页对话时，AI 以搜索模式返回相关文章列表。",

      "---",

      "## 三、性能优化",

      "- **ISR 缓存**：文章页面 60 秒增量静态再生成，数据库查询从每次请求降为按需触发",
      "- **数据库区域选择**：Neon PostgreSQL 选新加坡节点，国内访问延迟从 3s 降至 ~240ms",
      "- **Markdown 服务端渲染**：unified 管线在 Node 端执行，不将解析器打包到客户端",
      "- **精灵图预加载**：组件挂载时预加载所有动画帧到 Map，消除动画切换的闪烁",
      "- **Cloudflare CDN**：静态资源通过 Cloudflare 边缘节点分发，国内访问可用",

      "---",

      "## 四、模拟面试问答",

      "### Q1: 为什么选择 Next.js 14 而不是纯 React + Express？",

      "**面试官可能关注**：你是否理解框架选型的 trade-off。",

      "**参考回答**：",
      "> 这个项目的核心需求是博客——文章内容需要 SEO，但同时也需要后台管理和 AI 聊天等交互功能。Next.js 14 的 App Router 让我在一个项目里同时拥有 SSR（文章详情对搜索引擎友好）、ISR（列表页缓存减轻数据库压力）、API Routes（AI 聊天、宠物对话、文件上传等后端逻辑），不需要额外维护一个 Express 服务。",
      ">",
      "> 如果拆成 React + Express，我需要分别部署前端和后端，处理 CORS、两套环境变量、两个域名或反向代理，对于个人项目来说运维成本远超收益。选 Next.js 是把复杂度控制在合理范围内的决策。",

      "### Q2: 为什么用 Prisma 而不是直接写 SQL 或者用 TypeORM？",

      "**参考回答**：",
      "> Prisma 最大的优势是类型安全。Schema 定义后自动生成 TypeScript 类型，`prisma.post.findUnique({ include: { tags: {...} } })` 的返回值类型完全自动推导，不需要手写 interface。这在频繁迭代的个人项目中特别有价值——改 Schema 后编译器直接告诉我哪些地方需要更新。",
      ">",
      "> 原生 SQL 更灵活但没有类型安全，TypeORM 的 Active Record 模式在关联查询时容易写出 N+1。Prisma 的 `include` 语法会自动优化为 JOIN 或批量查询，且 generated types 让重构更安全。",

      "### Q3: 你的认证方案为什么把 auth.config 和 auth.ts 分离？",

      "**参考回答**：",
      "> 这是为了解决 NextAuth.js v5 在 Edge Runtime 上的兼容性问题。Next.js 的 middleware 默认运行在 Edge Runtime，而 bcryptjs 依赖 Node.js 的 `crypto` 模块，在 Edge 中会报错。",
      ">",
      "> 我的方案是：`auth.config.ts`（导出 `authConfig`）只包含 JWT 配置，不涉及 bcrypt，可以安全运行在 middleware 的 Edge Runtime 中做路由保护；`auth.ts`（导出 `auth`）引入 Credentials Provider + bcryptjs，只在 API Routes 和 Server Components 中使用。这个分离让我既能在 middleware 层拦截未登录请求，又不会因为 Node.js 依赖导致 Edge 运行时错误。",

      "### Q4: 桌面宠物怎么做的？Canvas 和 DOM 动画选哪个？",

      "**参考回答**：",
      "> 宠物用了 Canvas 2D API。选择 Canvas 而不是 DOM/CSS 动画的原因是：精灵图动画需要频繁切换裁剪区域（idle 22 帧 × 12fps），用 DOM 需要不断切换 background-position，大量重绘开销大。Canvas 的 `drawImage` 在同一个上下文中绘制，性能更好。",
      ">",
      "> 具体实现：单张 PNG 精灵图，通过帧索引计算 `sx = frameIndex * frameWidth` 裁剪源图，`ctx.drawImage(img, sx, 0, fw, fh, 0, 0, size, size)` 绘到 Canvas。requestAnimationFrame 循环根据 fps 配置决定何时切帧。左右翻转通过 `ctx.scale(-1, 1)` 实现，不额外加载素材。",

      "### Q5: AI 聊天为什么不直接用 WebSocket？",

      "**参考回答**：",
      "> 这个场景不需要 WebSocket。AI 聊天是「请求-流式响应」模式，不是「双向实时通信」模式。Server-Sent Events (SSE) 完全满足需求——客户端发送一个 POST 请求，服务端通过 `ReadableStream` 逐块返回 DeepSeek API 的响应，前端用 `response.body.getReader()` 读取流。",
      ">",
      "> SSE 的优势是：HTTP 协议原生支持，不需要额外的连接管理；Vercel 的 Serverless Function 天然适合短连接（最长 60 秒），刚好覆盖一次对话；如果换成 WebSocket，需要额外维护连接状态，在 Serverless 环境下更复杂且没必要。",

      "### Q6: 如果流量增长 10 倍，这个架构哪里先出问题？",

      "**参考回答**：",
      "> 1. **Neon PostgreSQL**（免费 tier）：连接数有限制，高并发下会出现连接池耗尽。解决方案：Prisma Data Proxy 或连接池中间件，或者升级到付费计划。",
      "> 2. **DeepSeek API 限流**：AI 对话接口有 QPS 限制。需要在前端加防抖、后端加请求队列，超过限额时返回友好提示而非报错。",
      "> 3. **Vercel Serverless 超时**：AI 流式对话最长 60 秒，如果 DeepSeek 响应慢可能超时。可以改为 Edge Function 或引入超时重试机制。",
      "> 4. **ISR 缓存失效**：文章更新后需要手动 `revalidatePath`，目前没有 Webhook。可以在 Vercel 上配置 Deploy Hook，或者改用 On-demand ISR。",
      ">",
      "> 这些问题的解决成本都不高，说明当前架构在个人博客量级下是合适的选择——没有过度设计，但预留了扩展路径。",

      "### Q7: 这个项目最大的技术难点是什么？",

      "**参考回答**：",
      "> 最难的部分是**让各个子系统协调工作而不互相干扰**。",
      ">",
      "> 举几个实际踩过的坑：",
      "> - **字体闪烁**：Playfair Display 和 LXGW WenKai 是外部字体，加载完成前浏览器用回退字体渲染，导致页面跳动。解决方案：`next/font` 的内置 `font-display: swap` + Tailwind 的 `font-['Playfair_Display']` 声明。",
      "> - **主题与第三方组件同步**：Giscus 评论用 `<script>` 标签动态加载，随主题切换需要重新挂载。解决方案：`MutationObserver` 监听 `<html>` class 变化，切换时先 `removeChild` 再重新 `appendChild`。",
      "> - **Edge vs Node 运行时分离**：前面提到的 auth.config / auth.ts 拆分。",
      "> - **国内访问延迟**：Neon 默认 US East 节点，国内 3 秒白屏。分析后发现是数据库延迟而非静态资源，将 Neon 迁到新加坡，配合 ISR 缓存，降至 ~240ms。",
      ">",
      "> 这些问题单个看起来都不算「高深」，但放在一起就是真实的工程体验——你得理解每一层在干什么，才能定位瓶颈。",

      "---",

      "## 五、总结：这个项目展示了什么能力？",

      "| 能力维度 | 体现 |",
      "|----------|------|",
      "| 前端工程化 | Next.js App Router、SSR/ISR/CSR 混合、Tailwind 主题系统 |",
      "| 全栈能力 | API Routes、认证鉴权、数据库建模、文件上传 |",
      "| AI 集成 | LLM API 调用、流式响应、上下文注入、Prompt Engineering |",
      "| 性能优化 | ISR 缓存、CDN、数据库区域选择、精灵图预加载 |",
      "| 工程素养 | 路由权限分离、死代码清理、类型安全、Edge/Node 兼容 |",
      "| 产品意识 | 404 页面、错误边界、加载状态、移动端适配、暗色模式 |",

      "> 这个项目不是「最好的博客」，但它是一个**真实的独立全栈项目**——从需求到上线，从功能到体验，每一步的决策都有据可查。把它放在简历上，你可以自信地回答任何一个「为什么」。",
    ].join("\n\n"),
    tags: [t1, t2, t3],
  };

  await prisma.post.upsert({
    where: { slug: article.slug },
    update: {
      title: article.title, content: article.content, excerpt: article.excerpt,
      categoryId: cat.id, published: true, wordCount: article.content.length,
      readingTime: Math.ceil(article.content.length / 200), authorId: u.id,
    },
    create: {
      title: article.title, slug: article.slug, content: article.content, excerpt: article.excerpt,
      categoryId: cat.id, published: true, publishedAt: new Date(),
      wordCount: article.content.length, readingTime: Math.ceil(article.content.length / 200),
      authorId: u.id, views: Math.floor(Math.random() * 200) + 50,
    },
  });

  const post = await prisma.post.findUnique({ where: { slug: article.slug } });
  if (post) {
    await prisma.tagsOnPosts.deleteMany({ where: { postId: post.id } });
    for (const t of article.tags) {
      await prisma.tagsOnPosts.create({ data: { postId: post.id, tagId: t.id } });
    }
  }

  console.log("Done:", article.title);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
