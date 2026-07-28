<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0
Rationale: MAJOR — initial constitution for project; all principles newly defined
Modified principles: N/A (new)
Added sections: All (Core Principles, Design Constraints, Development Workflow, Governance)
Removed sections: None
Templates requiring updates:
  ✅ plan-template.md — Constitution Check section aligns with new principles
  ✅ spec-template.md — No changes needed (template is principle-agnostic)
  ✅ tasks-template.md — No changes needed
Follow-up TODOs: None
-->

# 个人网站内容管理系统 Constitution

## Core Principles

### I. 简洁至上 (Simplicity First)

每个技术选择必须用最简方案。对于个人网站规模：
- **MUST**: 单项目、单数据库文件、单管理员账号
- **MUST**: 不做过度抽象（如多层 service/repository 模式），直连 SQLite 可接受
- **MUST NOT**: 引入不需要微服务、消息队列、缓存层等基础设施
- **Rationale**: 个人网站只有一个用户（管理员）和少量并发访问，复杂度是最大的敌人

### II. Newsprint 设计完整性 (Design Integrity)

所有 UI 输出必须严格遵守 Newsprint 设计系统：
- **MUST**: 零圆角（border-radius: 0），无软阴影，无渐变
- **MUST**: 仅使用设计系统定义的色板：`#F9F9F7`（背景）、`#111111`（油墨）、`#CC0000`（编辑红）、`#E5E5E0`（分割灰）
- **MUST**: 字体使用 Playfair Display（标题）、Lora（正文）、Inter（UI）、JetBrains Mono（数据）
- **MUST NOT**: 暗色模式 — 设计系统为永久浅色模式
- **Rationale**: 设计一致性是网站的核心价值，混乱的样式比功能缺失更致命

### III. 客户端与管理端分离 (Client-Admin Separation)

客户端和管理端必须有清晰的隔离：
- **MUST**: 客户端所有页面为只读，无任何编辑入口
- **MUST**: 管理端通过独立路由（`/admin/*`）访问，全部需要认证
- **MUST**: 中间件拦截所有 `/admin/*` 和写 API 请求，未认证返回 401/重定向
- **Rationale**: 安全边界清晰可验证，误修改零风险

### IV. 安全最小化 (Security Minimalism)

认证安全足够但不过度：
- **MUST**: 管理员密码使用 bcrypt（12 rounds）哈希存储
- **MUST**: Session 使用 iron-session 加密 cookie，30 分钟过期
- **MUST**: 连续 5 次登录失败锁定 15 分钟
- **MUST NOT**: 双因素认证、OAuth、密码重置 — 单用户无必要
- **Rationale**: 防止暴力破解足够，过度安全措施对个人网站增加维护负担无收益

## Design Constraints

### 技术栈锁定

- **前端框架**: Next.js 15+ (App Router), React 19+
- **样式**: Tailwind CSS 3 + 自定义 Newsprint CSS 工具类
- **数据库**: SQLite (better-sqlite3 同步 API)
- **认证**: iron-session + bcryptjs
- **图标**: lucide-react (stroke-width: 1.5)
- **部署**: Node.js 服务，本地文件系统存储上传文件

### 文件上传约束

- **MUST**: 仅允许 JPG、PNG、WebP 格式
- **MUST**: 单文件 ≤ 10MB
- **MUST**: 服务端二次校验格式和大小（不信任客户端验证）

### 浏览器支持

- Chrome、Edge、Firefox、Safari 最新两个主版本
- 响应式布局：桌面优先，移动端适配

## Development Workflow

### 代码规范

- TypeScript strict mode 开启
- 组件使用 `forwardRef`（React 19 ref-as-prop 兼容）
- UI 组件使用 `class-variance-authority` + `tailwind-merge` 管理变体
- 所有交互元素 `min-h-[44px] min-w-[44px]` 触摸目标

### 测试策略

- 手动验证优先：使用 `quickstart.md` 中的 5 个场景进行功能验证
- 自动化测试按需补充（非 MVP 阶段要求）

### 提交规范

- 一个 task 一个 commit（或逻辑相关的 task 组）
- Commit message 格式: `feat(scope): description` / `fix(scope): description`

## Governance

- Constitution 修改需在 `.specify/memory/constitution.md` 中更新并记录 Sync Impact Report
- 版本号遵循语义化版本：MAJOR（原则增删/重新定义）、MINOR（新增章节/扩展）、PATCH（措辞修正）
- 所有 `/speckit-plan` 需执行 Constitution Check 关检查

**Version**: 1.0.0 | **Ratified**: 2026-07-28 | **Last Amended**: 2026-07-28
