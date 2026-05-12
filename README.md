# 数字档案馆 📽️

一个以 Vibe Coding 方式打造的个人学习博客。记录技术学习轨迹，AI 加持的知识库式阅读体验。

**博客地址**: [asher1211.blog](https://asher1211.blog)

## 项目初衷

传统写博客：打开编辑器 → 搭框架 → 写样式 → 接数据库 → 部署 → 写文章。每个环节都是体力活，常常搭完架子就没力气写内容了。

这个项目是一次实验——**全程用 AI（DeepSeek + Claude Code）Vibe Coding**。我只负责描述需求和确认效果，具体代码全部由 AI 完成。从 zero 到上线，不到一周。

## 功能

### 前台
- 📝 Markdown 文章渲染（Shiki 代码高亮 + KaTeX 数学公式 + 图片懒加载）
- 🎬 电影感暗色主题 + 亮色模式切换 + 粒子背景
- 📊 学习时间线，按月分组展示
- 🔍 关键字搜索 + AI 语义搜索（DeepSeek V3）
- 🏷️ 分类 & 标签独立浏览页，支持搜索筛选
- 📱 响应式适配手机/平板
- 💬 文章内 Giscus 评论系统
- 🔗 文章前后篇导航
- 📡 RSS 订阅 (`/api/feed.xml`)

### 后台
- ✏️ Markdown 编辑器（@uiw/react-md-editor），实时预览 + 自动保存草稿
- 🖼️ 图片拖拽上传，自动插入 Markdown 语法
- 📂 分类管理 + 标签管理（增删改）
- 📈 仪表板数据统计（文章数/字数/分类/标签）

### AI + 桌宠
- 💬 **文章内 AI 对话** — 卷卷自动读取当前文章内容，基于上下文回答问题
- 🔎 **跨文章 AI 搜索** — 自然语言描述需求，卷卷在全站搜索并返回可点击链接
- 🐱 **桌宠「卷卷」** — Canvas 序列帧动画（idle 22帧 / walk 12帧 / chat 9帧），支持 PNG 精灵图、自动随机漫步、拖拽移动、方向翻转

### 部署与优化
- 🌐 **自定义域名 + Cloudflare CDN** — 国内用户无需翻墙访问
- 📈 **SEO 优化** — sitemap.xml / robots.txt / OpenGraph 标签
- ⚡ **ISR 缓存** — 前台页面每 60 秒增量更新

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | SSR/ISR，前后端一体 |
| 样式 | Tailwind CSS + Framer Motion | 原子化样式 + 动画 |
| 数据库 | PostgreSQL (Neon Serverless) | 免费 0.5GB，新加坡节点 |
| ORM | Prisma 5 | 类型安全，迁移便捷 |
| 认证 | NextAuth.js v5 (beta) | JWT + Credentials Provider |
| AI | DeepSeek Chat API (V3) | OpenAI 兼容，流式对话 |
| Markdown | unified + remark + rehype + Shiki + KaTeX | GFM + 代码高亮 + 数学公式 |
| 评论 | Giscus | 基于 GitHub Discussions，免费 |
| 域名 | NameSilo + Cloudflare CDN | 自定义域名 + 免费 CDN |
| 部署 | Vercel | 自动 CI/CD，GitHub 推送即部署 |

## 本地开发

### 1. 环境要求

- Node.js 18+
- PostgreSQL 数据库（推荐 [Neon](https://neon.tech) 免费版）

### 2. 克隆安装

```bash
git clone https://github.com/Asher1211/my-blog.git
cd my-blog
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
DATABASE_URL="postgresql://..."    # Neon 连接字符串
NEXTAUTH_SECRET="随机字符串"         # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
DEEPSEEK_API_KEY="sk-..."          # DeepSeek API Key
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_ENABLE_PET_CHAT=true   # 桌宠聊天开关
```

### 4. 初始化数据库

```bash
npx prisma db push
```

### 5. 创建管理员

```bash
node --env-file=.env.local -e "
const bcrypt=require('bcryptjs');
const{PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
(async()=>{
  const h=await bcrypt.hash('你的密码',12);
  await p.user.upsert({where:{email:'admin@blog.com'},update:{password:h},create:{email:'admin@blog.com',name:'博主',role:'ADMIN',password:h}});
  console.log('Done');
  await p.\$disconnect();
})();
"
```

### 6. 插入示例文章（可选）

```bash
node --env-file=.env.local scripts/seed-vibe-coding.mjs
```

### 7. 启动

```bash
npm run dev
```

访问 `http://localhost:3000`，登录 `http://localhost:3000/login`。

## 部署

### Vercel + Cloudflare（国内可访问）

1. **Push 到 GitHub** — 代码推送到你的仓库

2. **Vercel 部署**
   - [vercel.com](https://vercel.com) → New Project → Import 仓库
   - 环境变量添加 `DATABASE_URL` / `NEXTAUTH_SECRET` / `DEEPSEEK_API_KEY`
   - 构建命令：`prisma generate && next build`
   - Deploy → 拿到 `xxx.vercel.app` 域名

3. **Cloudflare CDN**
   - [dash.cloudflare.com](https://dash.cloudflare.com) → Add site → 输入你的域名
   - DNS 添加 A 记录指向 `76.76.21.21`（Vercel IP），橙色云朵 Proxied
   - 域名注册商处将 NS 改为 Cloudflare 提供的地址

4. **Vercel 绑定域名**
   - Settings → Domains → 添加 `asher1211.blog`

### Neo 数据库 Region 选择

如果在国内，Neon 创建 Project 时 Region 选 **AWS Asia Pacific (Singapore)**。美国节点延迟 ~3s，新加坡 ~240ms，快 12 倍。

### 环境变量清单

| Key | 必须 | 说明 |
|-----|------|------|
| `DATABASE_URL` | 是 | Neon PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 是 | 随机密钥 |
| `NEXTAUTH_URL` | 是 | 站点完整 URL |
| `DEEPSEEK_API_KEY` | 否 | AI 对话功能（不填则卷卷聊天不可用） |
| `NEXT_PUBLIC_SITE_URL` | 否 | sitemap/OG 使用的域名 |
| `NEXT_PUBLIC_ENABLE_PET_CHAT` | 否 | 桌宠聊天开关（`false` 关闭） |

## 桌宠序列帧

桌宠使用 Canvas 渲染 PNG 精灵图。将序列帧图片放入 `public/pet/`：

```
public/pet/
  idle.png    ← 待机动画（帧水平排列）
  walk.png    ← 行走动画
  chat.png    ← 说话动画
```

每张图的帧数和帧率在 `components/pet/PetSprite.tsx` 的 `SPRITE_MAP` 中配置。

## 项目结构

```
app/
  (public)/         前台页面
  admin/            后台管理
  api/              API 路由
  login/            登录页
  sitemap.ts        站点地图
  robots.ts         爬虫规则
  not-found.tsx     自定义 404
components/
  ai/               AI 聊天组件
  admin/            后台组件
  blog/             文章卡片
  common/           光标/进度条/TOC/评论/粒子/主题
  editor/           MD 编辑器 + 图片上传
  layout/           页头/页脚/侧边栏
  pet/              桌宠系统
lib/
  ai/               DeepSeek 客户端 & 提示词
  auth/             认证辅助
  db/               Prisma 单例
  data/             数据查询
  markdown/         MD 渲染管线
  pet/              桌宠状态机
  utils/            工具函数
prisma/
  schema.prisma     数据库模型
scripts/
  seed-*.mjs        数据填充脚本
public/
  pet/              精灵图资源
  uploads/          上传图片
```

## License

MIT
