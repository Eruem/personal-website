# Research: 个人网站内容管理系统

**Created**: 2026-07-28
**Purpose**: 技术选型决策记录

---

## 1. 全栈框架: Next.js 14+ (App Router)

**Decision**: Next.js 14+ App Router

**Rationale**:
- React 前端 + API Routes 后端在单项目中统一管理，部署简单（`next start` 一条命令）
- App Router 支持 React Server Components，客户端展示页可 SSR 提升首屏性能
- 路由组 `(client)` / `(admin)` 天然支持不同布局
- 中间件 (`middleware.ts`) 可集中处理管理端认证拦截
- Server Actions 可简化管理端表单提交（图片上传除外）

**Alternatives considered**:
- Vite + Express: 前后端分离但需要两个服务进程，部署复杂度翻倍
- Remix: 优秀的替代方案，但 Next.js 生态更大、社区资源更多

---

## 2. 数据库: SQLite via better-sqlite3

**Decision**: better-sqlite3 (同步 API)

**Rationale**:
- 单文件数据库，零配置，与个人网站规模完美匹配
- 同步 API 在 Node.js 中代码更简洁，无回调地狱
- better-sqlite3 性能远超 `sqlite3` 异步库（实测 2-5x）
- 数据库文件 `data/site.db` 可直接备份
- 不需要单独数据库服务进程

**Alternatives considered**:
- `sqlite3` (异步): API 回调模式繁琐，性能不如 better-sqlite3
- PostgreSQL/MySQL: 需要额外安装维护数据库服务，对个人网站过度
- JSON 文件: 无查询能力、无并发安全、数据量大时性能差

---

## 3. 认证: iron-session + bcryptjs

**Decision**: iron-session 加密 cookie 会话 + bcryptjs 密码哈希

**Rationale**:
- iron-session 将 session 数据加密存储在 sealed cookie 中，无需服务端 session store
- 与 SQLite 数据库无耦合，不需要 session 表
- bcryptjs 是纯 JS 实现，无原生编译依赖，跨平台兼容性好
- 单用户场景不需要 OAuth/多用户/角色权限

**Alternatives considered**:
- NextAuth.js (Auth.js): 功能全面但重，单用户场景过度设计
- JWT: 需要管理 refresh token 和黑名单，单用户场景复杂化无必要
- 纯 localStorage token: 不安全，XSS 可直接窃取

---

## 4. 文件上传: 本地文件系统 + 格式验证

**Decision**: 直接写入 `public/uploads/` 目录，前端通过 `multer` 风格解析 FormData

**Rationale**:
- Next.js Route Handlers 原生支持 `request.formData()`
- 写入 `public/` 下可直接通过 URL 访问，无需额外静态文件服务
- 格式验证 (JPG/PNG/WebP) + 10MB 大小限制在服务端二次校验
- 文件按类型分子目录: `avatar/`, `background/`, `portfolio/`

**Alternatives considered**:
- Cloudflare R2 / AWS S3: 增加外部依赖和成本，个人网站过度
- Base64 存数据库: 数据库膨胀、读取慢、无缓存

---

## 5. UI 框架: Tailwind CSS + Newsprint 设计系统

**Decision**: Tailwind CSS 3 + 自定义 Newsprint 工具类

**Rationale**:
- Tailwind 的 utility-first 方法与 Newsprint 的高度定制化风格天然契合
- 零圆角、硬阴影、特殊字体栈均可通过 `tailwind.config.ts` 全局配置
- 纹理图案 (dot grid, line grid) 写入 `<style>` 标签和 CSS 工具类
- `class-variance-authority` + `tailwind-merge` 管理按钮/卡片变体

**Key configuration**:
```ts
// tailwind.config.ts
extend: {
  borderRadius: { DEFAULT: '0px' }, // 全局零圆角
  fontFamily: {
    serif: ['Playfair Display', 'Times New Roman', 'serif'],
    body: ['Lora', 'Georgia', 'serif'],
    sans: ['Inter', 'Helvetica Neue', 'sans-serif'],
    mono: ['JetBrains Mono', 'Courier New', 'monospace'],
  },
  colors: {
    newsprint: {
      bg: '#F9F9F7',
      ink: '#111111',
      muted: '#E5E5E0',
      red: '#CC0000',
    }
  }
}
```

---

## 6. 图标: lucide-react

**Decision**: lucide-react, `strokeWidth={1.5}`

**Rationale**:
- 线性图标与 Newsprint 风格的黑白简洁感一致
- Tree-shaking 友好，仅加载使用的图标
- 统一的 stroke width 保证视觉一致性
- 与 React 19 完全兼容

---

## 7. 测试: Vitest + @testing-library/react

**Decision**: Vitest (单元/组件测试), 可选 Playwright (E2E)

**Rationale**:
- Vitest 与 TypeScript/ESM 原生兼容，配置极简
- 与 Vite 同生态，速度快于 Jest
- @testing-library/react 测试组件行为而非实现细节
- API Routes 用 Vitest 直接调用 handler 函数测试

---

## 8. 图像效果: CSS filter

**Decision**: CSS `grayscale` + `hover:sepia-[50%]` 实现图像效果

**Rationale**:
- Newsprint 设计要求图片默认灰度、hover 复古棕褐
- 纯 CSS 方案，零 JS 开销
- 管理端上传原图保留色彩信息，客户端展示时应用滤镜

**Alternatives considered**:
- sharp/image-processing 服务端预处理: 需要原生编译，且丢失原图色彩用于管理端预览

---

## Summary: 技术栈总览

| 层级 | 技术 |
|------|------|
| 全栈框架 | Next.js 14+ (App Router) |
| 前端 UI | React 19, Tailwind CSS 3 |
| 组件工具 | class-variance-authority, tailwind-merge |
| 图标 | lucide-react |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | iron-session + bcryptjs |
| 文件上传 | FormData → 本地文件系统 |
| 测试 | Vitest + @testing-library/react |
| 设计系统 | Newsprint (零圆角 + 黑/白/红 + 衬线体) |
