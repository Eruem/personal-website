# Quickstart: 个人网站内容管理系统

**Created**: 2026-07-28
**Purpose**: 从零搭建到功能验证的端到端指南

---

## 前置要求

- Node.js 18+ 和 pnpm（或 npm）
- 现代浏览器 (Chrome/Edge/Firefox/Safari)

---

## 初始化项目

```bash
# 1. 创建 Next.js 项目
pnpm create next-app@latest personal-website --typescript --tailwind --eslint --app --src-dir
cd personal-website

# 2. 安装依赖
pnpm add better-sqlite3 bcryptjs iron-session lucide-react class-variance-authority tailwind-merge
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react

# 3. 创建目录结构
mkdir -p src/app/"(client)" src/app/"(admin)"/login src/app/"(admin)"/dashboard
mkdir -p src/app/api/auth/login src/app/api/auth/logout src/app/api/auth/me
mkdir -p src/app/api/site-config src/app/api/portfolio
mkdir -p src/components/ui src/components/client src/components/admin
mkdir -p src/lib data public/uploads/avatar public/uploads/background public/uploads/portfolio
```

---

## 环境变量

创建 `.env.local`:

```env
# 管理员初始账号（首次启动自动创建）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# iron-session 密钥（至少 32 字符随机字符串）
SESSION_SECRET=your-random-secret-at-least-32-chars

# 数据库路径
DATABASE_PATH=data/site.db
```

---

## 核心配置

### `src/lib/db.ts`

初始化 SQLite 连接和表结构（参考 [data-model.md](./data-model.md) 中的 DDL）。

### `src/lib/auth.ts`

配置 iron-session:

```ts
import { getIronSession, SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'admin-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 60, // 30 分钟
  },
};

export interface SessionData {
  username?: string;
  authenticated?: boolean;
}
```

### `src/middleware.ts`

保护 `/admin` 路由（除 `/admin/login`）:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // 仅检查管理端路由（排除 login 和 api/auth）
  if (request.nextUrl.pathname.startsWith('/admin') &&
      !request.nextUrl.pathname.startsWith('/admin/login')) {
    const session = await getIronSession(request, NextResponse.next(), sessionOptions);
    if (!session.authenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

---

## 验证场景

### 场景 1: 管理员登录

```bash
# 启动开发服务器
pnpm dev
```

1. 访问 `http://localhost:3000/admin/login`
2. 输入 `.env.local` 中配置的账号密码
3. ✅ 登录成功 → 跳转到 `/admin/dashboard`
4. ❌ 错误密码 → 显示 "用户名或密码错误"
5. ❌ 连续 5 次错误 → 显示 "账号已锁定"
6. ✅ 30 分钟无操作 → 刷新页面后跳转登录页

### 场景 2: 管理端修改头像/背景

1. 登录后进入管理仪表盘
2. 上传一张 JPG 头像 → ✅ 保存成功，显示预览
3. 上传超过 10MB 文件 → ❌ 提示 "文件大小超过限制"
4. 上传 PNG 背景图 → ✅ 保存成功
5. 刷新客户端首页 → ✅ 新头像和背景图已展示

### 场景 3: 作品管理

1. 添加作品：上传图片 + 输入标题/描述 → ✅ 出现在列表中
2. 添加第二个作品 → ✅ 列表中展示两个作品
3. 拖拽调整排序 → ✅ 顺序更新
4. 删除第一个作品 → ✅ 列表中只剩一个，关联图片已删除

### 场景 4: 客户端展示

1. 访问 `http://localhost:3000/`（无需登录）
2. ✅ 看到头像、背景图、个人简介
3. ✅ 作品区域自动轮播
4. ✅ 点击轮播左右箭头切换图片
5. ✅ 点击指示器圆点跳转对应作品
6. ✅ 图片加载失败时显示占位图
7. ❌ 页面无任何编辑按钮或入口

### 场景 5: Newsprint 视觉风格

1. ✅ 全站零圆角（按钮、卡片、输入框均为直角）
2. ✅ 背景色为 `#F9F9F7`（新闻纸灰白），文字为 `#111111`（油墨黑）
3. ✅ 所有图片默认灰度（grayscale），hover 显示复古棕褐（sepia）
4. ✅ 首页大标题使用 Playfair Display 衬线体
5. ✅ 边框为纯黑实线，无模糊阴影
6. ✅ 页面存在网格纹理（dot grid pattern on body）

---

## 运行命令

```bash
pnpm dev          # 开发模式
pnpm build        # 生产构建
pnpm start        # 生产运行
pnpm test         # 运行测试
```
