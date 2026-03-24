# Serverless Notes - 个人随笔系统

基于 Next.js + Supabase + Vercel 的 Serverless 架构个人随笔系统。

## 项目概述

这是一个完全免费的在线随笔管理系统，支持：
- 🌐 在线编辑：浏览器中直接写作和管理
- 📱 跨平台访问：PC + 手机响应式设计
- 🗄️ 云数据库：PostgreSQL 数据安全存储
- 🔐 用户认证：邮箱/GitHub 登录
- 📝 Markdown 编辑器：实时预览
- 🏷️ 标签系统：分类和搜索
- 📊 三级日志系统：完整追溯历史
- ⚡ 性能优化：图片懒加载、代码分割、错误边界
- 🎨 SEO 优化：完整的元数据配置

## 技术栈

- **前端框架**: Next.js 16+ (App Router)
- **UI 组件**: Tailwind CSS 4 + Shadcn/ui
- **数据库**: Supabase (PostgreSQL)
- **部署平台**: Vercel
- **状态管理**: Zustand
- **Markdown**: react-markdown + remark-gfm

## 模块

- 🎵 音乐 - 音乐相关的随笔和评论
- 🎬 电影 - 电影观后感和影评
- 📚 书籍 - 读书笔记和书评
- ⚽ 运动 - 运动记录和健身日志
- ✈️ 旅游 - 旅行游记和攻略

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Supabase 账号
- Vercel 账号（用于部署）

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd serverless-notes
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制 `.env.local.example` 为 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```
   
   填入你的 Supabase 配置：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   访问 http://localhost:3000

### 部署到 Vercel

详细部署指南请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

## 项目结构

```
serverless-notes/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # 仪表盘页面
│   │   ├── login/              # 登录页面
│   │   └── auth/               # 认证回调
│   ├── components/             # React 组件
│   │   ├── ui/                 # 基础 UI 组件
│   │   ├── layout/             # 布局组件
│   │   ├── notes/              # 随笔相关组件
│   │   └── common/             # 通用组件
│   ├── lib/                    # 工具库
│   │   └── supabase/           # Supabase 客户端
│   └── types/                  # TypeScript 类型
├── public/                     # 静态资源
├── DEPLOYMENT.md               # 部署指南
├── OPTIMIZATION.md             # 优化文档
└── package.json
```

## 核心功能

### ✅ 已实现
- 用户认证（邮箱登录/注册）
- 随笔 CRUD（创建、读取、更新、删除）
- Markdown 编辑器（实时预览）
- 模块化管理（5个领域）
- 标签系统
- 搜索功能
- 三级日志系统
- 响应式设计
- 错误边界保护
- SEO 优化

### 🚧 开发中
- 图片上传和管理
- 批量操作
- 数据导出（Markdown/PDF）
- PWA 支持
- 离线功能

## 性能优化

项目已实施以下优化措施：

- ✅ 图片懒加载（Next.js Image）
- ✅ 代码分割和动态导入
- ✅ 错误边界保护
- ✅ 加载状态优化
- ✅ SEO 元数据配置
- ✅ 响应式图片

详细优化文档：[OPTIMIZATION.md](./OPTIMIZATION.md)

## 文档

- [构建计划](../CONSTRUCTION_PLAN_SERVERLESS.md) - 完整的项目构建计划
- [部署指南](./DEPLOYMENT.md) - Vercel 部署详细步骤
- [优化文档](./OPTIMIZATION.md) - 性能和用户体验优化

## 开发状态

✅ **已部署到 Vercel**

当前版本：v0.1.0（Beta）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

---

**创建日期**: 2026-03-24
**最后更新**: 2026-03-24
**状态**: 已部署，持续优化中