# API Contracts: 个人网站内容管理系统

**Created**: 2026-07-28
**Base URL**: `/api`

---

## 通用约定

### 认证

管理端 API 需要有效 irn-session cookie（登录后自动携带）。未认证返回:

```json
{ "error": "Unauthorized" }
// HTTP 401
```

### 成功响应格式

```json
{
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应格式

```json
{
  "error": "错误描述",
  "details": "详细错误信息（可选）"
}
```

### 文件上传限制

- 格式: `image/jpeg`, `image/png`, `image/webp`
- 大小: ≤ 10MB
- 超出限制返回 HTTP 400

---

## Auth

### POST `/api/auth/login`

登录管理端。

**Request**:
```
Content-Type: application/json

{
  "username": "admin",
  "password": "mypassword"
}
```

**Response (200)**:
```json
{
  "data": { "username": "admin" },
  "message": "登录成功"
}
```

**Response (401)**:
```json
{ "error": "用户名或密码错误" }
```

**Response (429)**:
```json
{ "error": "账号已锁定，请15分钟后重试" }
```

**Rules**:
- 连续 5 次失败 → 锁定 15 分钟（基于内存计数器）
- 成功后重置失败计数
- Session 有效期 30 分钟无操作

---

### POST `/api/auth/logout`

登出管理端。

**Response (200)**:
```json
{ "message": "已登出" }
```
销毁 session cookie。

---

### GET `/api/auth/me`

获取当前登录状态。

**Response (200)**:
```json
{
  "data": { "username": "admin", "authenticated": true }
}
```

**Response (401)**:
```json
{ "error": "Unauthorized" }
```

---

## Site Config

### GET `/api/site-config`

获取网站全局配置（公开接口，无需认证）。

**Response (200)**:
```json
{
  "data": {
    "avatar_path": "uploads/avatar/me.jpg",
    "background_path": "uploads/background/bg.jpg",
    "bio": "你好，我是一名...",
    "site_title": "张三的个人主页"
  }
}
```

---

### PUT `/api/site-config`

更新网站配置（需认证）。

**Request**:
```
Content-Type: multipart/form-data

avatar: [File] (可选 — 仅当更换头像)
background: [File] (可选 — 仅当更换背景)
bio: "新的个人简介..." (可选)
site_title: "新标题" (可选)
```

**Response (200)**:
```json
{
  "data": {
    "avatar_path": "uploads/avatar/new-avatar.jpg",
    "background_path": "uploads/background/bg.jpg",
    "bio": "新的个人简介...",
    "site_title": "新标题"
  },
  "message": "网站配置已更新"
}
```

**Response (400)**:
```json
{ "error": "文件格式不支持，仅允许 JPG/PNG/WebP" }
// 或
{ "error": "文件大小超过 10MB 限制" }
```

**Rules**:
- 仅更新提供的字段（部分更新）
- 旧文件被新文件替换时删除旧文件
- 如果更新 bio 或 site_title 不提供文件，则不修改图片路径

---

## Portfolio

### GET `/api/portfolio`

获取作品列表（公开接口）。

**Response (200)**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "项目 A",
      "description": "这是一个...",
      "image_path": "uploads/portfolio/project-a.jpg",
      "sort_order": 0
    },
    {
      "id": 2,
      "title": "项目 B",
      "description": "另一个...",
      "image_path": "uploads/portfolio/project-b.jpg",
      "sort_order": 1
    }
  ]
}
```
按 `sort_order` 升序排列。

---

### POST `/api/portfolio`

添加作品（需认证）。

**Request**:
```
Content-Type: multipart/form-data

image: [File] (必填)
title: "项目名称" (必填)
description: "项目描述" (可选)
sort_order: 0 (可选)
```

**Response (201)**:
```json
{
  "data": {
    "id": 3,
    "title": "项目名称",
    "description": "项目描述",
    "image_path": "uploads/portfolio/new-project.jpg",
    "sort_order": 0
  },
  "message": "作品已添加"
}
```

---

### PUT `/api/portfolio/[id]`

更新作品（需认证）。`id` 为动态路由参数。

**Request**:
```
Content-Type: multipart/form-data

image: [File] (可选)
title: "新标题" (可选)
description: "新描述" (可选)
sort_order: 1 (可选)
```

**Response (200)**:
```json
{
  "data": { "id": 3, "title": "新标题", ... },
  "message": "作品已更新"
}
```

---

### DELETE `/api/portfolio/[id]`

删除作品（需认证）。

**Response (200)**:
```json
{ "message": "作品已删除" }
```

同时删除关联的图片文件。

**Response (404)**:
```json
{ "error": "作品不存在" }
```

---

### PUT `/api/portfolio/reorder`

批量更新作品排序（需认证）。

**Request**:
```
Content-Type: application/json

{
  "items": [
    { "id": 1, "sort_order": 0 },
    { "id": 2, "sort_order": 1 },
    { "id": 3, "sort_order": 2 }
  ]
}
```

**Response (200)**:
```json
{ "message": "排序已更新" }
```
