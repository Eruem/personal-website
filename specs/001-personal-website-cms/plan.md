# Implementation Plan: 个人网站内容管理系统

**Branch**: `001-personal-website-cms` | **Date**: 2026-07-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-personal-website-cms/spec.md`

## Summary

构建一个 Newsprint 新闻纸风格的个人展示网站，采用 Next.js 全栈架构。客户端为只读展示页（头像、背景图、个人简介、作品轮播），管理端通过 iron-session + bcrypt 认证登录后可修改所有展示内容。数据存储使用 SQLite，上传文件存储在服务器本地文件系统。

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 14+ App Router)

**Primary Dependencies**: Next.js, React 19, Tailwind CSS 3, iron-session, bcryptjs, better-sqlite3, lucide-react, class-variance-authority, tailwind-merge

**Storage**: SQLite (better-sqlite3, 同步直连), 上传文件 → 本地文件系统 `public/uploads/`

**Testing**: Vitest + @testing-library/react

**Target Platform**: Web 浏览器 (Chrome/Edge/Firefox/Safari), Node.js 服务器

**Project Type**: Web 应用 (全栈单项目)

**Performance Goals**: 首页加载 < 3s (SC-001), 轮播切换响应 < 300ms (SC-004), 管理端操作成功率 ≥ 99% (SC-005)

**Constraints**: 单管理员用户、仅浅色模式、零圆角 Newsprint 风格、图片上传 ≤ 10MB、仅允许 JPG/PNG/WebP、桌面端管理、响应式客户端

**Scale/Scope**: 1 个管理员、少量并发访问者、4 个页面路由、3 个 API 路由组、13 个功能需求

## Constitution Check

*GATE: Constitution 模板未填充具体原则，无约束需要验证 — 通过。*

| 检查项 | 状态 |
|--------|------|
| 安全性 (FR-008 暴力破解锁定, bcrypt 哈希, iron-session 加密) | ✅ 通过 |
| 可维护性 (清晰的项目结构, 组件复用) | ✅ 通过 |
| 简洁性 (单项目, SQLite 无额外服务) | ✅ 通过 |

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-website-cms/
├── plan.md              # 本文件
├── research.md          # Phase 0 技术研究
├── data-model.md        # Phase 1 数据模型
├── quickstart.md        # Phase 1 快速验证指南
├── contracts/           # Phase 1 API 合约
│   └── api.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (client)/              # 客户端路由组 (只读展示)
│   │   ├── page.tsx           # 首页 — 头像+背景+简介+轮播
│   │   └── layout.tsx         # 客户端布局 (Header + Footer)
│   ├── (admin)/               # 管理端路由组 (需登录)
│   │   ├── login/
│   │   │   └── page.tsx       # 登录页
│   │   ├── dashboard/
│   │   │   └── page.tsx       # 管理仪表盘
│   │   └── layout.tsx         # 管理端布局 (侧栏导航)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts # POST — 登录
│   │   │   └── logout/route.ts# POST — 登出
│   │   ├── site-config/
│   │   │   └── route.ts       # GET/PUT — 网站配置
│   │   └── portfolio/
│   │       └── route.ts       # GET/POST/PUT/DELETE — 作品 CRUD
│   ├── layout.tsx             # 根布局 (字体导入, 全局样式)
│   └── globals.css            # Tailwind + Newsprint CSS 工具类
├── components/
│   ├── ui/                    # Newsprint 原子组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── divider.tsx
│   │   └── section-header.tsx
│   ├── client/                # 客户端专用组件
│   │   ├── hero-banner.tsx    # 头像 + 背景图 + 简介
│   │   ├── portfolio-carousel.tsx  # 作品轮播
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── admin/                 # 管理端专用组件
│       ├── login-form.tsx
│       ├── avatar-upload.tsx
│       ├── background-upload.tsx
│       ├── portfolio-manager.tsx
│       └── site-config-form.tsx
├── lib/
│   ├── db.ts                  # better-sqlite3 连接 + 初始化
│   ├── auth.ts                # iron-session 配置 + 中间件
│   ├── upload.ts              # 文件上传验证与存储
│   └── constants.ts           # 文件大小/格式限制等常量
└── styles/
    └── newsprint.css          # Newsprint 纹理、shadow、字体工具类

public/
└── uploads/                   # 上传文件存储目录
    ├── avatar/
    ├── background/
    └── portfolio/

data/
└── site.db                    # SQLite 数据库文件 (自动创建)
```

**Structure Decision**: 采用 Next.js App Router 单项目结构。路由组 `(client)` 和 `(admin)` 分离客户端与管理端布局，中间件保护 `/admin` 路由。组件按 `ui`（原子）、`client`（展示）、`admin`（管理）三层组织。

## Complexity Tracking

> 无违反 Constitution 的项目 — 无需记录。
