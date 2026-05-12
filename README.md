# 数字档案馆 📽️

一个以 Vibe Coding 方式打造的个人学习博客。记录技术学习轨迹，AI 加持的知识库式阅读体验。

**博客地址**: [asher1211.blog](https://asher1211.blog)

## 项目初衷

传统写博客：打开编辑器 → 搭框架 → 写样式 → 接数据库 → 部署 → 写文章。每个环节都是体力活，常常搭完架子就没力气写内容了。

这个项目是一次实验——**全程用 AI（DeepSeek + Claude Code）Vibe Coding**。我只负责描述需求和确认效果，具体代码全部由 AI 完成。从 zero 到上线，不到一周。

## 功能

### 前台
- 📝 Markdown 文章渲染（代码高亮 + 数学公式 + 图片懒加载）
- 🎬 电影感暗色主题 + 亮色模式切换
- 📊 学习时间线，按月分组展示
- 🔍 关键字搜索 + AI 语义搜索
- 📱 响应式适配手机/平板

### 后台
- ✏️ Markdown 编辑器，实时预览 + 自动保存草稿
- 📂 分类 & 标签管理
- 📈 仪表板数据统计

### AI 功能
- 💬 **文章内 AI 对话** — 卷卷自动读取当前文章内容，基于上下文回答问题
- 🔎 **跨文章 AI 搜索** — 自然语言描述需求，卷卷帮你在全站找相关文章并返回可点击链接
- 🐱 **桌宠「卷卷」** — 二次元小助手，支持序列帧动画、拖拽移动、AI 聊天

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 样式 | Tailwind CSS + Framer Motion |
| 数据库 | PostgreSQL (Neon Serverless) |
| ORM | Prisma |
| 认证 | NextAuth.js v5 |
| AI | DeepSeek Chat API |
| Markdown | unified + remark + rehype + Shiki + KaTeX |
| 部署 | Vercel |

## 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/Asher1211/my-blog.git
cd my-blog
npm install
```

### 2. 配置环境变量

复制环境变量模板，填写真实值：

```bash
cp .env.example .env.local
```

`.env.local` 需要配置：

```env
DATABASE_URL="postgresql://..."   # Neon 连接字符串
NEXTAUTH_SECRET="随机字符串"        # `openssl rand -base64 32`
DEEPSEEK_API_KEY="sk-..."         # DeepSeek API Key
```

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 创建管理员

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

### 5. 插入示例文章

```bash
node --env-file=.env.local scripts/seed-vibe-coding.mjs
```

### 6. 启动

```bash
npm run dev
```

访问 `http://localhost:3000`，登录 `/login`。

## 部署

### Vercel

1. Fork 或克隆此仓库到你的 GitHub
2. 在 [vercel.com](https://vercel.com) 用 GitHub 登录
3. Import 仓库，添加环境变量
4. Deploy

需要配置的环境变量：

| Key | 说明 |
|-----|------|
| `DATABASE_URL` | Neon PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 随机密钥 |
| `DEEPSEEK_API_KEY` | DeepSeek API Key |

### Neon 数据库 Region 选择

如果你在国内，建议 Neon 创建 Project 时 Region 选 **AWS Asia Pacific (Singapore)**。美国节点延迟 3 秒，新加坡节点 240ms，快 12 倍。

## 桌宠序列帧

桌宠支持 PNG 序列帧精灵图。将以下文件放入 `public/pet/` 即可自动切换：

```
public/pet/
  idle.png    ← 待机（帧水平排列）
  walk.png    ← 行走
  chat.png    ← 说话
  sleep.png   ← 睡觉
  excited.png ← 兴奋
```

每张图的帧数在 `components/pet/PetSprite.tsx` 的 `SPRITE_MAP` 中配置。

## 项目结构

```
app/
  (public)/     前台页面
  admin/        后台管理
  api/          API 路由
  login/        登录页
components/
  ai/           AI 聊天组件
  blog/         文章卡片
  common/       光标/进度条/主题等
  editor/       Markdown 编辑器
  layout/       页头/页脚/侧边栏
  pet/          桌宠系统
lib/
  ai/           DeepSeek 客户端 & 提示词
  auth/         认证辅助
  db/           Prisma 单例
  data/         数据查询
  markdown/     MD 渲染管线
  pet/          桌宠状态机
  utils/        工具函数
prisma/
  schema.prisma 数据库模型
```

## License

MIT
