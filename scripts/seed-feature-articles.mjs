import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst();

  let cat = await prisma.category.upsert({
    where: { name: "项目更新" },
    create: { name: "项目更新", slug: "updates", color: "#a855f7" },
    update: {},
  });

  const t1 = await prisma.tag.upsert({ where: { name: "功能迭代" }, create: { name: "功能迭代", slug: "feature-update" }, update: {} });
  const t2 = await prisma.tag.upsert({ where: { name: "项目总结" }, create: { name: "项目总结", slug: "project-summary" }, update: {} });
  const t3 = await prisma.tag.upsert({ where: { name: "部署" }, create: { name: "部署", slug: "deploy" }, update: {} });

  const articles = [
    {
      title: "博客功能完善记：评论、RSS、SEO 和更多",
      slug: "blog-features-roundup",
      excerpt: "记录博客上线后的功能迭代：Giscus 评论系统、RSS 订阅、前后篇导航、自定义 404、标签筛选优化等。",
      categoryId: cat.id,
      tags: [t1, t2],
      content: [
        "## 概述",
        "博客从最低可用到真正好用，中间还有很多细节要打磨。这篇文章记录了上线后的一系列功能完善。",
        "### Giscus 评论系统",
        "选择了 Giscus 而不是自建评论，原因是：",
        "- **免费** — 基于 GitHub Discussions，不需要额外服务",
        "- **无广告** — 不像 Disqus 那样插入广告",
        "- **Markdown 支持** — 评论区可以写代码块",
        "集成方式很简单，Giscus 生成一段 script 标签，我封装成 React 组件挂到文章底部。",
        "一个关键细节：博客有自定义暗色/亮色切换，Giscus 需要跟随主题变化。用 MutationObserver 监听 html 的 class 变化，主题切换时自动重载 Giscus。",
        "### RSS 订阅",
        "Next.js 14 的 Route Handler 可以很方便地生成动态 XML。访问 /api/feed.xml 即可获取。读者用 Feedly、NetNewsWire 等阅读器订阅后，新文章自动推送。",
        "### SEO 优化",
        "三个文件撑起整个 SEO：",
        "1. **sitemap.ts** — 动态生成站点地图，包含所有已发布文章",
        "2. **robots.ts** — 禁止爬虫抓取后台和 API",
        "3. **OpenGraph meta** — 文章分享到社交媒体时显示卡片预览",
        "### 标签筛选优化",
        "当标签和分类数量增长后，文章页的筛选器会变得很长。做了两个优化：",
        "- **只显示前 10 个** — 按使用频率排序，最常用的优先展示",
        "- **全部链接** — 指向独立的分类/标签浏览页，那里有搜索功能",
        "### 图片上传",
        "编辑器的封面图和正文插图都支持拖拽上传。拖拽到上传区自动 POST 到 /api/upload，返回 URL 填入。",
      ].join("\n\n"),
    },
    {
      title: "数字档案馆开发全记录：从零到上线，一个 Vibe Coding 实验",
      slug: "digital-archive-dev-retrospective",
      excerpt: "回顾博客项目从技术选型到部署上线的完整历程：Next.js + Neon + DeepSeek + Cloudflare，全程 AI 辅助开发。",
      categoryId: cat.id,
      tags: [t1, t2, t3],
      content: [
        "## 起点",
        "2026年5月，我想做一个个人博客。和以往不同的是，这次我不打算手写代码——我要试试 Vibe Coding，用自然语言描述需求，让 AI 实现。",
        "## Phase 1：打地基",
        "Next.js 14 项目初始化 + Tailwind + Prisma + Neon PostgreSQL + NextAuth v5。只用邮箱密码登录，个人博客不需要 OAuth。",
        "## Phase 2：核心功能",
        "Markdown 编辑器（@uiw/react-md-editor）+ 分类标签系统（Prisma 多对多关系 + upsert 去重）。数据库从 US East 迁移到 Singapore，延迟从 3 秒降到 240ms。",
        "## Phase 3：AI + 桌宠",
        "DeepSeek V3 API 接入（OpenAI 兼容格式），封装流式对话和系统提示词。桌宠经历三个迭代：emoji → Canvas 程序化绘制 → PNG 序列帧精灵图（idle 22帧 / walk 12帧 / chat 9帧），支持拖拽、点击聊天、自动随机漫步。",
        "## Phase 4：视觉打磨",
        "电影感暗色主题 + 黄昏亮色模式 + Canvas 粒子背景 + 自定义光标 + 响应式适配。Giscus 评论、RSS 订阅、sitemap、前后篇导航等细节完善。",
        "## Phase 5：部署上线",
        "Vercel 自动部署（修复 build 命令添加 prisma generate）。国内访问 Vercel 域名被墙 → 买域名 asher1211.blog → Cloudflare DNS + CDN 代理 → 国内无需翻墙。",
        "## 数据",
        "| 指标 | 数值 |",
        "|------|------|",
        "| 开发周期 | ~7 天 |",
        "| 代码提交 | 30+ 次 |",
        "| AI 代码占比 | ~95% |",
        "| 月度成本 | ¥10/年（仅域名费） |",
        "## 体会",
        "Vibe Coding 的核心不是让 AI 写代码，而是把精力从怎么做转移到做什么。当不需要纠结 CSS 细节和 API 设计时，更多时间花在产品思考和内容创作上。",
        "AI 不是万能的。数据库连接超时、Edge Runtime 兼容性、序列帧加载时序——这些需要理解底层原理才能给出正确的描述。AI 是好用的笔，但你得知道自己想画什么。",
      ].join("\n\n"),
    },
  ];

  for (const a of articles) {
    await prisma.post.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title, content: a.content, excerpt: a.excerpt,
        categoryId: a.categoryId, published: true, wordCount: a.content.length,
        readingTime: Math.ceil(a.content.length / 200), authorId: u.id, publishedAt: new Date(),
      },
      create: {
        title: a.title, slug: a.slug, content: a.content, excerpt: a.excerpt,
        categoryId: a.categoryId, published: true, wordCount: a.content.length,
        readingTime: Math.ceil(a.content.length / 200), authorId: u.id, publishedAt: new Date(),
      },
    });
    const post = await prisma.post.findUnique({ where: { slug: a.slug } });
    await prisma.tagsOnPosts.deleteMany({ where: { postId: post.id } });
    for (const t of a.tags) {
      await prisma.tagsOnPosts.create({ data: { postId: post.id, tagId: t.id } });
    }
    console.log("Done:", a.title);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
