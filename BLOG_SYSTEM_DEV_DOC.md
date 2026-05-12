# 个人学习博客系统 - 完整开发文档

> **致开发 AI（DeepSeek V4 / Claude Code）的说明**
>
> 本文档是项目的核心设计蓝图，请在开发每一个模块前仔细阅读对应章节。
> **目录结构为参考设计，并非最终强制结构**，AI 可根据实际技术选型做合理调整，
> 但须保持模块边界清晰、职责单一。任何对文档描述的偏离，请在代码注释中说明原因。

---

## 目录

1.  项目概述
2.  技术选型
3.  系统架构
4.  参考目录结构
5.  核心功能模块
6.  前端设计规范
7.  AI 集成方案
8.  桌宠系统（Desk Pet）
9.  数据库设计
10. API 接口设计
11. 部署方案（免费优先）
12. 开发阶段规划
13. 安全与性能
14. 扩展功能预留

---

## 1. 项目概述

### 1.1 项目定位

这是一个**以学习记录为核心**的个人博客系统，面向博主本人的学习积累，同时向公众开放阅读。
系统最大的差异化亮点是：**内嵌 AI 助手可实时读取当前日志内容并与用户对话，
也可根据问题跨文章检索相关日志，实现"知识库式"的学习记录展示。**

### 1.2 用户角色

| 角色 | 权限描述 |
|------|----------|
| 博主（管理员） | 登录后台、撰写/编辑/删除日志、管理分类标签、查看统计 |
| 访客（公众） | 浏览前台所有公开日志、搜索文章、与 AI 助手对话 |

### 1.3 核心价值主张

- **学习轨迹可视化**：时间线、知识图谱展示学习进展
- **AI 加持阅读**：每篇文章配备上下文感知的 AI 聊天窗口
- **跨文章智能检索**：AI 可根据问题定位并推荐相关日志
- **Markdown 原生支持**：完整渲染 MD、代码高亮、数学公式、图片
- **公开访问**：部署后任何人可通过域名访问

---

## 2. 技术选型

### 2.1 整体技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14（App Router） | SSR/SSG 兼顾 SEO 与动态交互 |
| UI 组件库 | Tailwind CSS + Framer Motion | 工具类样式 + 高质量动画 |
| Markdown 渲染 | unified + remark + rehype | 支持 GFM、数学公式、代码高亮 |
| 代码高亮 | Shiki | 主题丰富，支持 TMLanguage |
| 数学公式 | KaTeX | 轻量快速 |
| 后端框架 | Next.js API Routes + tRPC（可选） | 全栈一体，减少项目复杂度 |
| 数据库 | PostgreSQL（Neon serverless 免费版） | 全托管，免费额度够用 |
| ORM | Prisma | 类型安全，迁移便捷 |
| 文件存储 | Cloudflare R2 或 Supabase Storage | 图片/附件存储，免费额度充足 |
| 认证 | NextAuth.js v5 | 支持 GitHub/Google OAuth 及密码登录 |
| AI 对话 | Anthropic Claude API（流式） | 实时流式对话，上下文感知 |
| 向量搜索 | pgvector（PostgreSQL 扩展） | 文章语义向量化，支持跨文章检索 |
| Embedding | Claude / OpenAI text-embedding | 文章内容向量化 |
| 部署 | Vercel（免费 Hobby Plan） | 全球 CDN，自动 CI/CD |
| 域名 | Vercel 免费子域 / 自定义域名 | 免费可用，可绑定自有域名 |

### 2.2 为什么选 Next.js 全栈

- 前后端同一仓库，部署简单
- Vercel 对 Next.js 原生支持，免费额度够个人博客使用
- App Router 支持 Server Components，利于 SEO
- API Routes 可直接调用数据库和 AI 接口

---

## 3. 系统架构

```
用户浏览器
    |
    v
[Vercel Edge / CDN]
    |
    v
[Next.js 应用]
    |-- [前台页面]  公开博客浏览、AI 聊天
    |-- [后台页面]  登录保护，管理日志
    |-- [API Routes]
          |-- /api/auth       认证（NextAuth）
          |-- /api/posts      日志 CRUD
          |-- /api/ai/chat    AI 对话（流式）
          |-- /api/ai/search  AI 跨文章检索
          |-- /api/upload     图片上传
          |
          v
    [Prisma ORM]
          |
          v
    [Neon PostgreSQL]
    - posts 表（文章内容 + 向量）
    - categories / tags 表
    - comments 表（预留）
    - users 表
          |
    [pgvector 扩展]  语义搜索
          |
    [Cloudflare R2]  图片存储
          |
    [Claude API]     AI 对话 + Embedding
```

---

## 4. 参考目录结构

> **AI 注意：以下目录结构为参考设计，实际开发中可根据框架约定和工程需要调整。
> 保持模块职责清晰是首要原则，结构本身可以变化。**

文件夹命名约定说明（AI 开发者必读）：
  - 圆括号文件夹，例如 public 和 admin，是 Next.js 路由组语法，圆括号是真实命名的一部分，
    作用是将路由分组但不影响 URL 路径，必须保留圆括号。
  - 方括号文件夹，例如 slug 和 id，是 Next.js 动态路由语法，方括号是真实命名的一部分，
    表示该段 URL 为动态参数，必须保留方括号。
  - 三点方括号文件夹，例如 ...nextauth，是 Next.js 捕获所有段路由，同样必须保留。
  - 以上均为框架约定，创建文件夹时请严格按照下方结构命名，不要改动括号。

project-root
    app
        (public)                        路由组，URL 中不含 public 这段
            page.tsx                    首页（博客列表 + Hero + 桌宠）
            about
                page.tsx                关于我页面
            posts
                page.tsx                文章列表页
                [slug]                  动态路由，slug 是文章的唯一标识
                    page.tsx            文章详情页（含 AI 聊天）
            tags
                [tag]                   动态路由，tag 是标签名
                    page.tsx            标签筛选页
            categories
                [category]              动态路由，category 是分类名
                    page.tsx            分类筛选页
            search
                page.tsx                全文搜索页
            timeline
                page.tsx                学习时间线页

        (admin)                         路由组，URL 中不含 admin 这段，整组需登录
            layout.tsx                  后台布局（侧边栏导航）
            dashboard
                page.tsx                数据概览仪表板
            posts
                page.tsx                文章管理列表
                new
                    page.tsx            新建文章（MD 编辑器）
                [id]
                    edit
                        page.tsx        编辑文章
            media
                page.tsx                媒体库（图片管理）
            categories
                page.tsx                分类管理
            settings
                page.tsx                系统设置（博主信息、桌宠配置）

        api
            auth
                [...nextauth]           捕获所有段，NextAuth 需要此命名
                    route.ts            NextAuth 认证端点
            posts
                route.ts                GET 列表 / POST 创建
                [id]
                    route.ts            GET 详情 / PATCH 更新 / DELETE 删除
            ai
                chat
                    route.ts            AI 对话（流式，携带文章上下文）
                search
                    route.ts            AI 语义跨文章检索
                embed
                    route.ts            文章向量化（管理端触发）
            pet
                route.ts                桌宠 AI 对话接口
                config
                    route.ts            桌宠配置读写
            upload
                route.ts                图片上传至 R2
            search
                route.ts                全文关键字搜索

        layout.tsx                      根布局（全局字体、主题、桌宠挂载点）
        globals.css                     全局样式变量

    components
        ui                              基础 UI 原子组件
            Button.tsx
            Badge.tsx
            Card.tsx
            Modal.tsx
            Tooltip.tsx
        layout
            Header.tsx                  前台导航栏
            Footer.tsx
            AdminSidebar.tsx            后台侧边栏
        blog
            PostCard.tsx                文章卡片
            PostList.tsx                文章列表
            PostDetail.tsx              文章详情（MD 渲染）
            TagCloud.tsx                标签云
            CategoryTree.tsx            分类树
            Timeline.tsx                学习时间线
        ai
            AiChatPanel.tsx             AI 聊天浮窗（文章内）
            AiSearchWidget.tsx          AI 跨文章检索输入框
            ChatMessage.tsx             单条消息气泡
            AiTypingEffect.tsx          流式打字效果
        pet                             桌宠系统组件，详见第 8 章
            DeskPet.tsx                 桌宠主组件（Canvas 渲染）
            PetSprite.tsx               精灵帧动画渲染器
            PetBubble.tsx               对话气泡（含 AI 回复）
            PetToolbar.tsx              右键或长按菜单
            PetEmotionBadge.tsx         情绪状态角标
        editor
            MarkdownEditor.tsx          后台 MD 编辑器
            ImageUploader.tsx           图片上传组件
            EditorToolbar.tsx           编辑器工具栏
        common
            ThemeToggle.tsx             明暗主题切换
            ScrollProgress.tsx          阅读进度条
            TableOfContents.tsx         文章目录（侧边浮动）
            CopyButton.tsx              代码块复制按钮
            ReadingTime.tsx             预计阅读时长

    lib
        db
            prisma.ts                   Prisma 客户端单例
        ai
            claude.ts                   Claude API 封装（流式对话）
            embedding.ts                文章向量化逻辑
            prompts.ts                  AI 系统提示词模板（含桌宠人格提示词）
        pet
            stateMachine.ts             桌宠状态机
            petAi.ts                    桌宠 AI 对话封装
            persistence.ts              桌宠状态持久化
        markdown
            processor.ts                unified 处理器配置
            plugins.ts                  自定义 remark 和 rehype 插件
        storage
            r2.ts                       Cloudflare R2 上传封装
        search
            vector.ts                   pgvector 语义搜索封装
        utils
            date.ts                     日期格式化
            slug.ts                     slug 生成
            reading-time.ts             阅读时间计算

    prisma
        schema.prisma                   数据库模型定义
        migrations                      数据库迁移文件

    public
        fonts                           自定义字体文件
        pet
            sprite-idle.png             待机动画帧
            sprite-walk.png             行走动画帧
            sprite-read.png             阅读动画帧
            sprite-chat.png             聊天动画帧
            sprite-sleep.png            睡眠动画帧
        og-image.png                    默认 OG 分享图

    styles
        cinema.css                      电影感动效专用样式

    types
        index.ts                        全局 TypeScript 类型定义

    middleware.ts                       Next.js 中间件（路由保护）
    next.config.ts                      Next.js 配置
    tailwind.config.ts                  Tailwind 配置（含自定义主题）
    tsconfig.json
    .env.example                        环境变量模板
    BLOG_SYSTEM_DEV_DOC.md              本文档

---

## 5. 核心功能模块

### 5.1 前台博客

#### 5.1.1 首页

- **Hero 区域**：大标题动画入场，背景使用电影感粒子/噪声纹理
- **精选文章**：最近更新的 3-5 篇文章卡片，带悬浮视差效果
- **分类导航**：横向滚动分类 Tag 栏
- **学习统计**：已写文章数、总字数、学习天数（数字滚动动画）
- **AI 搜索入口**：居中的 AI 搜索框，支持自然语言查询

#### 5.1.2 文章详情页

- **左侧主栏**：Markdown 渲染内容区（宽度约 65%）
- **右侧浮动**：目录（TOC）+ 阅读进度 + 相关文章推荐
- **顶部**：文章标题、发布时间、阅读时长、分类标签
- **底部**：上一篇 / 下一篇导航，标签列表
- **右下角浮动**：AI 聊天按钮，展开后为侧边抽屉
- **Markdown 特性支持**：
  - GFM（表格、任务列表、删除线）
  - 代码块（Shiki 高亮，显示语言标签 + 复制按钮）
  - 图片（懒加载、灯箱放大、alt 文字显示）
  - 数学公式（KaTeX 渲染行内与块级）
  - 引用块（带左边框装饰）
  - Mermaid 流程图（可选）

#### 5.1.3 学习时间线页

- 按月/年分组展示文章，纵向时间轴设计
- 每个节点显示文章标题、分类、字数
- 支持按分类筛选时间线

#### 5.1.4 搜索页

- 关键字全文搜索（数据库 LIKE 或 pg_trgm）
- AI 语义搜索（pgvector，用自然语言描述查找相关文章）
- 搜索结果高亮匹配词

### 5.2 后台管理

#### 5.2.1 认证

- 支持用户名 + 密码登录（博主唯一账号）
- 可选 GitHub OAuth（快速登录）
- 未认证访问 `/admin/**` 自动重定向到登录页
- Session 基于 JWT，存储在 httpOnly Cookie

#### 5.2.2 Markdown 编辑器

- 使用 `@uiw/react-md-editor` 或 `CodeMirror 6` + 自定义 Markdown 预览
- 编辑 / 预览 / 分屏 三种模式
- 图片拖拽上传（自动上传至 R2，插入 MD 语法）
- 自动保存草稿（localStorage，防意外丢失）
- 发布设置：标题、slug、分类、标签、摘要、封面图、发布状态（草稿/发布）
- 文章发布后自动触发向量化（调用 `/api/ai/embed`）

#### 5.2.3 仪表板

- 总文章数、总字数、分类数、标签数
- 最近 7 天浏览量折线图（需集成 Vercel Analytics 或自建统计）
- 最近编辑的文章列表

### 5.3 AI 功能模块

详见第 7 章。

---

## 6. 前端设计规范

> **AI 开发者注意**：本章是前端视觉的核心约束，请严格遵守。
> 风格方向：**电影感暗调赛博朋克 + 精致排版**，有动态感但不浮夸。

### 6.1 视觉风格定义

**主题**：深夜放映厅 / 数字档案馆

> 想象一个深夜的私人放映室，用数字光线书写学习的故事。
> 黑色背景、琥珀色 / 冷青色光晕、胶片颗粒感、精准的网格线，
> 每一次交互都像按下了放映机的快门。

### 6.2 色彩系统

```css
:root {
  /* 背景层次 */
  --bg-base:      #0a0a0f;   /* 最深背景，近黑 */
  --bg-surface:   #111118;   /* 卡片/面板背景 */
  --bg-elevated:  #1a1a26;   /* 悬浮元素背景 */
  --bg-overlay:   #22223a;   /* 模态/抽屉背景 */

  /* 主色调：冷青 + 琥珀双色系 */
  --accent-cyan:  #00d4ff;   /* 主强调色，链接、按钮、激活态 */
  --accent-amber: #f5a623;   /* 辅助强调色，标签、日期、高亮 */
  --accent-glow:  rgba(0, 212, 255, 0.15); /* 发光晕效果 */

  /* 文字层次 */
  --text-primary:   #e8e8f0;  /* 主正文 */
  --text-secondary: #8888aa;  /* 次要说明文字 */
  --text-muted:     #44445a;  /* 禁用/占位文字 */
  --text-accent:    #00d4ff;  /* 强调文字 */

  /* 边框 */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.12);
  --border-accent:  rgba(0, 212, 255, 0.4);

  /* 胶片颗粒遮罩（用 CSS noise 纹理模拟） */
  --grain-opacity: 0.03;
}
```

### 6.3 字体规范

```css
/* 主显示字体：Playfair Display（标题）*/
/* 副显示字体：JetBrains Mono（代码、数字、技术元素）*/
/* 正文字体：LXGW WenKai（中文优先，优雅手写风）*/
/* 回退字体：Noto Serif SC */

--font-display: 'Playfair Display', 'Noto Serif SC', serif;
--font-mono:    'JetBrains Mono', 'Fira Code', monospace;
--font-body:    'LXGW WenKai', 'Noto Serif SC', serif;

/* 字号 scale（基于 1.25 比例）*/
--text-xs:   0.64rem;
--text-sm:   0.8rem;
--text-base: 1rem;
--text-lg:   1.25rem;
--text-xl:   1.563rem;
--text-2xl:  1.953rem;
--text-3xl:  2.441rem;
--text-4xl:  3.052rem;
```

### 6.4 动效规范

> 所有动效遵循"克制但有力"原则：入场有仪式感，交互有反馈，不堆砌特效。

#### 页面入场（Framer Motion）

```tsx
// 标准页面入场动画（stagger children）
const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
}

// 列表子项交错入场
const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } }
}
```

#### 特效清单（须实现）

| 效果 | 位置 | 实现方式 |
|------|------|----------|
| 胶片颗粒叠加层 | 全局背景 | CSS `::after` + SVG feTurbulence noise |
| 扫描线动画 | Hero 背景 | CSS 渐变 + animation |
| 数字滚动计数 | 首页统计 | Framer Motion useMotionValue |
| 卡片边框光晕 | 文章卡片悬浮 | CSS box-shadow + transition |
| 阅读进度条 | 文章详情顶部 | scroll 事件 + CSS width 动画 |
| 代码块入场 | 文章内代码块 | Intersection Observer + CSS |
| AI 打字光标 | AI 回复区域 | CSS animation blink |
| 侧边抽屉滑入 | AI 聊天面板 | Framer Motion x transform |
| 图片懒加载淡入 | 文章图片 | Next.js Image + blur placeholder |
| 时间轴节点脉冲 | 时间线页 | CSS keyframe pulse |

#### 鼠标交互

```css
/* 自定义光标（桌面端）*/
cursor: none; /* 隐藏默认光标，用 JS div 跟随模拟 */
/* 光标：小圆点 + 延迟跟随大圆，悬浮链接时大圆变形 */
```

### 6.5 组件视觉规范

#### 文章卡片

```
+-----------------------------------------+
| [封面图缩略图，16:9，带模糊渐变遮罩]        |
+-----------------------------------------+
| [分类标签，琥珀色]           [阅读时长]    |
| 文章标题（2行截断）                        |
| 摘要（3行截断，次要色）                    |
| [发布日期]              [字数统计]         |
+-----------------------------------------+
悬浮时：整卡片轻微上浮 4px + 青色边框光晕
```

#### AI 聊天面板

```
右侧抽屉，宽 380px，从右滑入
+-----------------------------------------+
| AI 助手                            [X]  |
| "我已读取本文，可以提问～"               |
+-----------------------------------------+
| [用户消息，右对齐，青色气泡]             |
| [AI 消息，左对齐，暗色气泡，流式打字]    |
+-----------------------------------------+
| [输入框]                      [发送]     |
+-----------------------------------------+
底部提示："AI 可跨文章检索相关内容"
```

#### 代码块

```
顶部横条：语言标签（左）+ 文件名（中，可选）+ 复制按钮（右）
背景：#0d1117（GitHub Dark 风格）
行号：显示，次要色
字体：JetBrains Mono 14px
圆角：8px
```

### 6.6 响应式断点

```
移动端：  < 768px   单列，AI 聊天为全屏弹出
平板：    768-1024px 文章页隐藏 TOC 侧边栏
桌面：    > 1024px   完整三栏布局
宽屏：    > 1440px   内容区限宽 1200px，两侧留白
```

---

## 7. AI 集成方案

### 7.1 文章内 AI 聊天

**功能**：用户在阅读文章时，可打开 AI 聊天面板，AI 已预先读取当前文章全文，
可基于文章内容回答问题、解释概念、拓展知识点。

**实现流程**：

```
前端加载文章详情页
    → 渲染 Markdown 内容
    → 用户点击右下角"AI 助手"按钮
    → 侧边聊天面板展开
    → 用户输入问题
    → POST /api/ai/chat
        Body: { question, postId, conversationHistory }
    → 后端读取文章完整内容（Markdown 原文）
    → 构建 System Prompt（含文章内容）
    → 调用 Claude API（stream: true）
    → 流式返回 SSE 到前端
    → 前端逐字渲染回复
```

**System Prompt 模板（`lib/ai/prompts.ts`）**：

```typescript
export const buildArticleChatPrompt = (article: {
  title: string;
  content: string;
  tags: string[];
}) => `
你是博主的学习助手，正在辅助读者阅读一篇学习笔记。

【当前文章】
标题：${article.title}
标签：${article.tags.join(', ')}

【文章内容】
${article.content}

【你的职责】
1. 基于上述文章内容回答读者的问题，优先引用文章原文。
2. 若问题超出文章范围，可适当拓展，但须注明"文章未涉及，以下为补充说明"。
3. 若读者询问博客中其他相关文章，请告知可使用 AI 跨文章搜索功能。
4. 回答使用中文，风格简洁专业，适当使用 Markdown 格式。
5. 不要编造文章中没有的内容。
`;
```

### 7.2 跨文章 AI 语义检索

**功能**：用户在搜索框输入自然语言描述（如"有没有关于 React hooks 的笔记"），
AI 根据向量相似度找到最相关的文章并返回摘要与链接。

**实现流程**：

```
用户输入查询语句
    → POST /api/ai/search
        Body: { query }
    → 后端将 query 调用 Embedding API 得到向量
    → pgvector 执行 cosine similarity 检索（TOP 5）
    → 将检索到的文章摘要拼入 Prompt
    → 调用 Claude 生成自然语言回答
        （包含：相关文章列表 + 每篇的关联说明）
    → 返回给前端渲染
```

**数据库 Schema（关键字段）**：

```sql
ALTER TABLE posts ADD COLUMN embedding vector(1536);
CREATE INDEX ON posts USING ivfflat (embedding vector_cosine_ops);
```

**向量化触发时机**：

- 文章发布时自动调用 `/api/ai/embed`
- 文章内容更新时重新向量化
- 管理员可在后台手动触发全量重建

### 7.3 Claude API 调用封装（`lib/ai/claude.ts`）

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 流式对话（用于文章内聊天）
export async function streamChat(params: {
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  return client.messages.stream({
    model: 'claude-opus-4-5',
    max_tokens: 2048,
    system: params.systemPrompt,
    messages: params.messages,
  });
}

// 获取文本向量（用于语义搜索）
// 注：Claude 目前无原生 Embedding，可用 voyage-3 或 OpenAI text-embedding-3-small
export async function getEmbedding(text: string): Promise<number[]> {
  // 接入 Voyage AI 或 OpenAI Embedding API
  // 返回 1536 维向量
}
```

### 7.4 AI 功能边界说明

| 功能 | 上下文范围 | 说明 |
|------|-----------|------|
| 文章内聊天 | 当前文章全文 | 每次对话携带完整文章 Markdown |
| 跨文章检索 | 全量文章向量库 | 向量相似度检索，非全文传入 |
| 摘要生成 | 单篇文章 | 后台发布时可一键生成摘要 |
| 标签推荐 | 单篇文章 | 后台编辑时 AI 推荐标签 |

---

## 8. 桌宠系统（Desk Pet）

> 桌宠是博客的灵魂担当，全站固定显示在右下角，有独立的生命状态，能感知用户行为，
> 并通过 Claude API 进行轻量对话。它不只是装饰，而是博客的"吉祥物 + 小助手"。

### 8.1 设计定位

- **视觉形象**：像素风小人（16x16 或 32x32 格子精灵图），风格与博客电影感主题呼应，
  可设计为一个戴着胶卷帽的小研究员形象
- **挂载位置**：全局根布局（`app/layout.tsx`）固定渲染，z-index 最高层，
  位于屏幕右下角，不遮挡主要阅读区域
- **交互感**：有呼吸感，不是静态图片，时刻有细微动作（眨眼、摆尾、小跳等）

### 8.2 状态机设计

桌宠拥有 6 种核心状态，由 `lib/pet/stateMachine.ts` 管理：

| 状态 | 触发条件 | 动画表现 | 持续时间 |
|------|---------|---------|---------|
| idle（待机） | 默认状态，无操作 | 原地轻微摆动、偶尔眨眼 | 无限循环 |
| walk（漫步） | idle 超过 30 秒随机触发 | 在屏幕底部左右行走 | 5-10 秒 |
| read（阅读） | 用户停留在文章页超过 10 秒 | 拿着小书本点头 | 持续至离开页面 |
| chat（对话） | 用户点击桌宠 / AI 回复时 | 嘴巴动、表情活泼 | 对话期间 |
| sleep（睡眠） | 页面无操作超过 5 分钟 | 闭眼、出现 Zzz 气泡 | 直到有操作 |
| excited（兴奋） | 新文章发布 / 博主登录 | 跳跃、星星特效 | 3 秒后恢复 |

状态转换逻辑：

```
idle --[30s无操作]--> walk --[动画结束]--> idle
idle --[文章页停留10s]--> read --[离开文章页]--> idle
idle --[点击桌宠]--> chat --[对话结束]--> idle
idle --[5min无操作]--> sleep --[任意操作]--> idle
任意状态 --[新文章发布]--> excited --[3s]--> idle
```

### 8.3 AI 对话功能

点击桌宠弹出对话气泡，用户可输入任意内容，桌宠通过 Claude API 以其人格回复。

**桌宠人格提示词（`lib/ai/prompts.ts`）**：

```typescript
export const PET_SYSTEM_PROMPT = `
你是博主的像素风小助手，名字叫「卷卷」，是一只戴着胶卷帽的小研究员。
你住在博客右下角，陪伴博主记录学习旅程。

【你的性格】
- 活泼可爱，偶尔卖萌，但在解答技术问题时认真专业
- 喜欢用颜文字，回复不超过 3 句话，简短有趣
- 知道博主在学习什么（通过当前页面的文章内容感知）
- 会主动关心博主，比如学习太久了提醒休息

【你知道的信息】
当前页面：{currentPageTitle}
当前文章分类：{currentCategory}
博主今天写了：{todayPostCount} 篇文章

【回复风格示例】
用户：「这道题我不会」
回复：「没关系！(´▽\`ʃ♡ƪ) 把问题告诉我，咱们一起想想看～」

用户：「好累啊」
回复：「学了好久啦，要不要休息一下？(＞﹏＜) 喝杯水再继续吧！」
`;
```

**API 路由（`app/api/pet/route.ts`）**：

```typescript
// POST /api/pet
// Body: { message, context: { pageTitle, category } }
// 返回：流式 SSE，桌宠回复内容
// 无需用户认证，公开访问
// Rate Limit：每 IP 每分钟 20 次
```

### 8.4 行为感知

桌宠通过以下事件感知用户行为，自动切换状态和触发反应：

```typescript
// lib/pet/stateMachine.ts 需监听的事件
const petTriggers = {
  onArticleEnter: () => 切换到 read 状态，气泡显示「在看这篇呢～」,
  onArticleScroll: (progress) => progress > 80% 时气泡显示「快读完啦！」,
  onCodeBlockCopy: () => 气泡显示「代码拿走不谢 (＾▽＾)」,
  onSearchOpen: () => 气泡显示「找什么东西呀？」,
  onIdle5min: () => 切换到 sleep 状态,
  onPageVisible: () => 从 sleep 唤醒,
};
```

### 8.5 渲染方案

使用 Canvas API 渲染精灵帧动画，性能优于 GIF，且可动态控制：

```typescript
// components/pet/PetSprite.tsx 核心逻辑
// 1. 加载精灵图（PNG 格式，各状态横向排列帧）
// 2. requestAnimationFrame 循环，按帧率切割绘制
// 3. 状态切换时平滑过渡（淡入淡出）
// 4. 支持水平翻转（walk 状态左右行走时）

const SPRITE_CONFIG = {
  frameWidth: 32,    // 单帧宽度（px）
  frameHeight: 32,   // 单帧高度（px）
  scale: 3,          // 放大倍数，实际显示 96x96
  fps: 8,            // 动画帧率
};
```

### 8.6 拖拽与位置记忆

```typescript
// 桌宠可被拖拽到屏幕任意位置
// 位置保存在 localStorage，下次访问恢复
// 拖拽时显示半透明状态，松手后弹回最近边缘吸附
const PET_DEFAULT_POSITION = { right: 24, bottom: 24 }; // px
```

### 8.7 后台配置（可选）

博主可在后台 Settings 页面配置桌宠：

- 开关桌宠显示（访客可见 / 仅博主可见）
- 修改桌宠名字
- 选择精灵图皮肤（预留多套皮肤接口）
- 调整桌宠 AI 人格（自定义部分提示词）

### 8.8 数据库字段（附加到 User 模型）

```prisma
model PetConfig {
  id           String  @id @default(cuid())
  name         String  @default("卷卷")
  visible      Boolean @default(true)  // 是否对访客显示
  skinId       String  @default("default")
  customPrompt String?                  // 自定义人格附加词
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id])
}
```

---

## 9. 数据库设计

### 8.1 Prisma Schema（`prisma/schema.prisma`）

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  posts     Post[]
}

enum Role {
  ADMIN
}

model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  content     String     // Markdown 原文
  excerpt     String?    // 摘要（可 AI 生成）
  coverImage  String?    // 封面图 URL
  published   Boolean    @default(false)
  views       Int        @default(0)
  wordCount   Int        @default(0)
  readingTime Int        @default(0)  // 分钟
  embedding   Unsupported("vector(1536)")?  // 语义向量
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  publishedAt DateTime?

  author      User       @relation(fields: [authorId], references: [id])
  authorId    String
  category    Category?  @relation(fields: [categoryId], references: [id])
  categoryId  String?
  tags        TagsOnPosts[]
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  color       String?  // 十六进制颜色
  posts       Post[]
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  slug  String        @unique
  posts TagsOnPosts[]
}

model TagsOnPosts {
  post   Post   @relation(fields: [postId], references: [id])
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id])
  tagId  String
  @@id([postId, tagId])
}
```

---

## 10. API 接口设计

### 10.1 文章接口

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/posts` | 公开 | 获取文章列表（分页、筛选） |
| GET | `/api/posts/[id]` | 公开 | 获取单篇文章详情 |
| POST | `/api/posts` | 管理员 | 创建文章 |
| PATCH | `/api/posts/[id]` | 管理员 | 更新文章 |
| DELETE | `/api/posts/[id]` | 管理员 | 删除文章 |

**GET `/api/posts` 查询参数**：

```
?page=1&limit=10&category=frontend&tag=react&status=published&sort=createdAt&order=desc
```

### 10.2 AI 接口

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/ai/chat` | 公开 | 文章内 AI 流式对话 |
| POST | `/api/ai/search` | 公开 | 语义跨文章检索 |
| POST | `/api/ai/embed` | 管理员 | 触发文章向量化 |

**POST `/api/ai/chat` Body**：

```json
{
  "postId": "clxxx",
  "question": "这篇文章里的 useEffect 和 useLayoutEffect 有什么区别？",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**响应**：`text/event-stream`（SSE 流式）

### 10.3 桌宠接口

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/pet` | 公开（有频率限制） | 桌宠 AI 对话（流式） |
| GET | `/api/pet/config` | 公开 | 获取桌宠配置（名字、皮肤、显示状态） |
| PATCH | `/api/pet/config` | 管理员 | 更新桌宠配置 |

### 10.4 上传接口

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/upload` | 管理员 | 上传图片至 R2，返回公开 URL |

---

## 11. 部署方案（免费优先）

### 11.1 推荐免费方案（完全免费）

```
代码托管：GitHub 私有仓库（免费）
应用托管：Vercel Hobby Plan（免费）
    - 100GB 带宽/月
    - 自动 HTTPS
    - 自定义域名支持
    - 自动 CI/CD（push 即部署）
数据库：Neon PostgreSQL（免费 Starter Plan）
    - 0.5 GB 存储
    - Serverless，自动休眠
    - 支持 pgvector 扩展
图片存储：Cloudflare R2（免费 10GB/月）
    - 无出站流量费（Workers 访问免费）
    - 需绑定 Cloudflare 账号
域名：Vercel 分配 xxx.vercel.app（免费）
    或：Freenom 免费域名（.tk/.ml/.ga，稳定性较差）
    或：购买 .com 域名（约 $10/年，推荐）
```

### 11.2 如何让他人访问

```
1. 将代码推送至 GitHub
2. 在 vercel.com 注册并导入 GitHub 仓库
3. 配置环境变量（DATABASE_URL, ANTHROPIC_API_KEY 等）
4. 部署完成后获得 https://your-blog.vercel.app 链接
5. 分享该链接即可，任何人均可访问
6. 可在 Vercel 控制台绑定自定义域名
```

### 11.3 环境变量清单（`.env.example`）

```bash
# 数据库（Neon 控制台获取）
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="random-secret-string"
NEXTAUTH_URL="https://your-blog.vercel.app"

# AI
ANTHROPIC_API_KEY="sk-ant-..."
VOYAGE_API_KEY="..."   # Embedding 服务（voyage-3，免费额度）

# 图片存储（Cloudflare R2）
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="blog-media"
R2_PUBLIC_URL="https://your-r2-domain.com"

# 管理员账号（初始化用）
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD_HASH="bcrypt-hashed-password"
```

### 11.4 升级方案（付费，流量大时考虑）

| 服务 | 方案 | 价格 |
|------|------|------|
| 数据库 | Neon Pro | $19/月 |
| 部署 | Vercel Pro | $20/月 |
| 搜索增强 | Algolia Build | 免费 10K 记录 |

---

## 12. 开发阶段规划

### Phase 1：基础骨架（第 1-2 周）

- [ ] Next.js 项目初始化，配置 Tailwind、Prisma、NextAuth
- [ ] Neon 数据库创建，执行 Prisma migrate
- [ ] 博主登录功能（Session 管理）
- [ ] 基础 API Routes（CRUD）
- [ ] 简单前台列表页 + 详情页（无样式）
- [ ] Markdown 渲染管线搭建

### Phase 2：核心功能（第 3-4 周）

- [ ] 后台 Markdown 编辑器集成
- [ ] 图片上传（R2 集成）
- [ ] 文章详情页完整渲染（代码高亮、数学公式、图片）
- [ ] 分类 / 标签系统
- [ ] 全文搜索（关键字）
- [ ] 阅读进度条、TOC 目录

### Phase 3：AI + 桌宠功能（第 5-6 周）

- [ ] Claude API 流式对话接入
- [ ] 文章内 AI 聊天面板
- [ ] pgvector 向量化管线
- [ ] 跨文章语义检索
- [ ] AI 摘要生成（后台工具）
- [ ] 桌宠精灵图帧动画渲染（Canvas）
- [ ] 桌宠状态机实现（6 种状态）
- [ ] 桌宠 AI 对话（卷卷人格）
- [ ] 桌宠行为感知（文章阅读/复制代码等事件）
- [ ] 桌宠拖拽与位置记忆

### Phase 4：视觉打磨（第 7 周）

- [ ] 全站电影感视觉系统实现
- [ ] Framer Motion 入场动画
- [ ] 自定义光标
- [ ] 胶片颗粒叠加层
- [ ] 响应式适配
- [ ] 深色/浅色主题切换（以深色为主）

### Phase 5：部署上线（第 8 周）

- [ ] Vercel 部署配置
- [ ] 环境变量配置
- [ ] SEO 优化（Meta、OG、sitemap、robots.txt）
- [ ] 性能优化（图片懒加载、代码分割）
- [ ] 功能测试

---

## 13. 安全与性能

### 13.1 安全措施

- 后台路由通过 `middleware.ts` 统一拦截验证 Session
- API Routes 中对管理员操作做二次 Session 验证
- 图片上传做文件类型白名单校验（仅允许 jpg/png/gif/webp/svg）
- AI 接口做请求频率限制（Rate Limit），防止滥用
  - 建议：每 IP 每分钟最多 10 次 AI 请求
  - 使用 Vercel KV 或内存计数器实现
- 所有数据库查询通过 Prisma（防 SQL 注入）
- XSS 防护：Markdown 渲染使用 `rehype-sanitize`

### 13.2 性能优化

- 文章列表使用 Next.js `generateStaticParams` 预渲染（ISR，每 60 秒重新验证）
- 图片使用 Next.js `<Image>` 组件（自动 WebP、懒加载）
- 代码分割：编辑器相关代码仅在后台页面加载
- Markdown 处理在服务端完成，不向客户端传输 unified 依赖
- 字体通过 `next/font` 自托管，避免 Google Fonts 请求
- AI 向量索引使用 ivfflat，检索控制在 100ms 以内

### 13.3 SEO 优化

```typescript
// app/(public)/posts/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage || '/og-image.png'],
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}
```

---

## 14. 扩展功能预留

以下功能在初版中预留接口，后续可迭代添加：

| 功能 | 说明 | 实现建议 |
|------|------|----------|
| 评论系统 | 访客留言 | Giscus（基于 GitHub Discussions）或自建 |
| RSS 订阅 | 标准 RSS 2.0 Feed | `/api/feed.xml` 动态生成 |
| 浏览量统计 | 每篇文章 PV 统计 | Vercel Analytics 或自建计数器 |
| 全站知识图谱 | 文章标签关联可视化 | D3.js 力导向图 |
| PWA 支持 | 离线缓存，可安装 | next-pwa 插件 |
| 多语言 | 中英双语 | next-intl |
| Newsletter | 邮件订阅更新通知 | Resend（免费 3000 封/月） |
| 代码运行沙箱 | 文章内可执行代码 | WebContainers 或 iframe 沙箱 |
| AI 日记总结 | 每周自动汇总学习进展 | Cron Job + Claude API |
| 桌宠多皮肤 | 解锁更多角色形象 | 精灵图资源替换，皮肤 ID 存 DB |
| 桌宠成长系统 | 随博客文章数增长解锁新动作 | 前端判断文章总数阈值 |
| 桌宠语音 | TTS 朗读桌宠回复 | Web Speech API（免费）|

---

## 附录：关键依赖版本参考

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "@prisma/client": "^5.14.0",
    "@anthropic-ai/sdk": "^0.24.0",
    "next-auth": "^5.0.0-beta",
    "framer-motion": "^11.2.0",
    "tailwindcss": "^3.4.0",
    "unified": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "rehype-katex": "^7.0.0",
    "rehype-sanitize": "^6.0.0",
    "shiki": "^1.6.0",
    "@aws-sdk/client-s3": "^3.600.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.4.0"
  }
}
```

---

*文档版本：v1.0 | 最后更新：2025年*

*本文档由博主结合 Claude AI 共同设计，用于指导 Claude Code + DeepSeek V4 协同开发。*
*开发过程中如遇文档与实际需求冲突，以实际需求为准，并在 PR 描述中注明修改原因。*
