# Serverless Notes 部署指南

## 部署到 Vercel

### 前置准备

1. **GitHub 账号**：确保代码已推送到 GitHub 仓库
2. **Vercel 账号**：访问 [vercel.com](https://vercel.com) 注册账号
3. **Supabase 项目**：确保已创建 Supabase 项目并配置好数据库

### 部署步骤

#### 方法一：通过 Vercel 网站部署（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库
   - 选择 `serverless-notes` 目录作为根目录

3. **配置环境变量**
   在 "Environment Variables" 部分添加以下变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
   ```

4. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常需要 2-3 分钟）
   - 部署成功后会获得一个 `.vercel.app` 域名

#### 方法二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd serverless-notes
   vercel
   ```

4. **配置环境变量**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **重新部署**
   ```bash
   vercel --prod
   ```

### 配置自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（通常需要几分钟到几小时）

### Supabase 配置

确保在 Supabase 项目中配置了正确的回调 URL：

1. 登录 Supabase Dashboard
2. 进入 Authentication → URL Configuration
3. 添加以下 URL 到 "Site URL" 和 "Redirect URLs"：
   ```
   https://your-project.vercel.app
   https://your-project.vercel.app/auth/callback
   ```

### 环境变量说明

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard → Settings → API |

### 自动部署

Vercel 会自动监听 GitHub 仓库的变化：
- **主分支推送**：自动部署到生产环境
- **其他分支推送**：自动创建预览部署
- **Pull Request**：自动创建预览部署并添加评论

### 常见问题

#### 1. 构建失败
- 检查 `package.json` 中的依赖是否完整
- 确保 Node.js 版本兼容（推荐 18.x 或更高）
- 查看构建日志获取详细错误信息

#### 2. 环境变量未生效
- 确保环境变量名称正确（区分大小写）
- 重新部署项目使环境变量生效
- 检查是否在正确的环境（Production/Preview/Development）中配置

#### 3. 认证失败
- 检查 Supabase 回调 URL 配置
- 确保环境变量正确设置
- 检查 Supabase 项目是否正常运行

#### 4. 数据库连接失败
- 确认 Supabase 项目状态正常
- 检查 RLS（行级安全）策略是否正确配置
- 验证 API 密钥是否有效

### 性能优化建议

1. **启用 Edge Functions**
   - Vercel 自动使用 Edge Runtime 优化性能
   - 确保 API Routes 使用 `export const runtime = 'edge'`（如需要）

2. **图片优化**
   - 使用 Next.js Image 组件
   - 配置 Supabase Storage 的 CDN

3. **缓存策略**
   - 配置适当的 `Cache-Control` 头
   - 使用 ISR（增量静态再生成）优化页面加载

### 监控和日志

1. **Vercel Analytics**
   - 在项目设置中启用 Analytics
   - 查看访问量、性能指标等

2. **日志查看**
   - Vercel Dashboard → Functions → Logs
   - 实时查看 Serverless 函数日志

3. **错误追踪**
   - 集成 Sentry 或其他错误追踪服务
   - 配置错误通知

### 成本估算

使用免费额度：
- **Vercel**：100GB 带宽/月，无限部署
- **Supabase**：500MB 数据库，1GB 存储
- **总成本**：0 元/月（个人使用完全免费）

### 备份策略

1. **数据库备份**
   - Supabase 自动每日备份
   - 可手动导出 SQL 备份

2. **代码备份**
   - GitHub 仓库自动版本控制
   - 定期创建 Release 标签

### 下一步

部署成功后，你可以：
1. 访问你的网站开始使用
2. 配置自定义域名
3. 邀请其他用户（如需要）
4. 定期备份数据
5. 监控网站性能和使用情况

---

**需要帮助？**
- Vercel 文档：https://vercel.com/docs
- Supabase 文档：https://supabase.com/docs
- Next.js 文档：https://nextjs.org/docs