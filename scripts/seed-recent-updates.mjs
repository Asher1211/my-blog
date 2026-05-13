import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findFirst();

  const cat = await prisma.category.upsert({
    where: { name: "项目更新" },
    create: { name: "项目更新", slug: "updates", color: "#a855f7" },
    update: {},
  });

  const t1 = await prisma.tag.upsert({ where: { name: "功能迭代" }, create: { name: "功能迭代", slug: "feature-update" }, update: {} });
  const t2 = await prisma.tag.upsert({ where: { name: "UX优化" }, create: { name: "UX优化", slug: "ux" }, update: {} });

  const articles = [
    {
      title: "界面瘦身：统一加载动画、后台卡片化与 Star 按钮",
      slug: "ui-polish-loading-admin-star",
      excerpt: "去掉复杂的骨架屏换用简洁加载条，后台文章管理改为卡片布局，添加 GitHub Star 按钮并支持暗亮色切换。",
      content: [
        "## 加载体验优化",
        "之前的骨架屏（Skeleton Screen）设计过于复杂，不同的页面有不同的骨架布局，但实际加载出来的内容和骨架差异较大，反而让人感觉突兀。",
        "换成了极简方案：导航栏下方一条金色细线，带呼吸动画。页面加载完成后自动消失。所有页面统一的加载视觉，干净低调。",
        "实现方式：Next.js 的 loading.tsx 约定。每个路由文件夹下放一个 loading.tsx，框架自动在页面数据加载期间显示。",
        "## 后台文章管理卡片化",
        "之前的后台文章列表是传统表格，列太多导致'阅读'竖着显示、按钮文字挤成竖排。",
        "改为卡片布局：每行一张卡片，标题 + 状态标签 + 元信息（分类/阅读/字数/日期）在一行，操作按钮（查看/编辑/删除）横排显示。同时加了分页支持，每页 15 篇。",
        "## 每页数量可切换",
        "前台文章列表和后台文章管理都加了'每页数量'下拉框：5 / 10 / 15 / 30 篇可选。切换后自动保持在同一个筛选条件下。",
        "## GitHub Star 按钮",
        "导航栏添加了 GitHub 官方 Star 按钮。第一个版本用 ghbtns.com 的 iframe，但暗色模式下颜色不跟随。改为用 GitHub API 获取真实 star 数量 + 自定义渲染，完美跟随博客暗色/亮色主题。",
        "## 其他细节",
        "- 分类管理增加描述字段，前台分类页展示",
        "- 清理了数据库中未使用的 pgvector 向量字段",
        "- 文章阅读量统计，每访问一次 +1",
        "- 后台可修改登录密码",
      ].join("\n\n"),
      tags: [t1, t2],
    },
    {
      title: "功能打磨：时间线、精确时间、分享与错误处理",
      slug: "feature-polish-timeline-datetime-share",
      excerpt: "时间线改为按年月日分组，文章时间精确到时分并显示更新时间，一键复制链接分享，全局错误友好提示。",
      content: [
        "## 时间线优化",
        "学习时间线从按月分组改为按年月日分组。每篇文章按发布时间归类到具体日期，时间轴节点带金色圆点标记，纵向竖线连接。",
        "排序规则：前台按发布时间降序，后台按更新时间降序。每次编辑后 updatedAt 自动更新，改过的文章会排到列表前面。",
        "## 时间精确到时分",
        "之前只显示'2026年5月12日'，现在显示'2026/05/13 14:30'。文章如果修改过，还会额外显示'更新于 XX:XX'，方便读者判断内容时效性。",
        "三个时间字段的区别：",
        "- createdAt: 存入数据库的时间，永远不变",
        "- publishedAt: 首次发布的时间，点了'发布'就固定",
        "- updatedAt: 最后修改时间，每次编辑自动更新（Prisma @updatedAt）",
        "## 文章分享按钮",
        "文章详情页标题下方加了'复制链接'按钮，点击复制当前页面 URL，并显示'已复制'反馈。实现在文章间互相引用分享时特别方便。",
        "## 错误友好处理",
        "数据库偶尔断连或请求超时时，之前直接显示空白错误页。现在加了 error.tsx 边界处理：前台页面报错显示'页面加载失败' + 重试按钮，全局异常显示'服务异常' + 返回首页链接。",
        "## 404 页面",
        "访问不存在的地址时，显示博客风格的自定义 404：大号金色数字、'这卷胶片还没有曝光...'文案、返回首页和浏览文章两个按钮。",
        "## 前后篇导航",
        "文章底部增加了上一篇 / 下一篇导航。读完一篇文章后不需要回到列表再点下一篇，直接往下滑就能跳转。如果没有上一篇或下一篇，显示'已是第一篇'或'已是最后一篇'。",
      ].join("\n\n"),
      tags: [t1, t2],
    },
  ];

  for (const a of articles) {
    await prisma.post.upsert({
      where: { slug: a.slug },
      update: {
        title: a.title, content: a.content, excerpt: a.excerpt,
        categoryId: cat.id, published: true, wordCount: a.content.length,
        readingTime: Math.ceil(a.content.length / 200), authorId: u.id,
      },
      create: {
        title: a.title, slug: a.slug, content: a.content, excerpt: a.excerpt,
        categoryId: cat.id, published: true, publishedAt: new Date(),
        wordCount: a.content.length, readingTime: Math.ceil(a.content.length / 200),
        authorId: u.id, views: Math.floor(Math.random() * 200) + 50,
      },
    });
    const post = await prisma.post.findUnique({ where: { slug: a.slug } });
    if (!post) continue;
    await prisma.tagsOnPosts.deleteMany({ where: { postId: post.id } });
    for (const t of a.tags) {
      await prisma.tagsOnPosts.create({ data: { postId: post.id, tagId: t.id } });
    }
    console.log("Done:", a.title);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
