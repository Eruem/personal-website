# Data Model: 个人网站内容管理系统

**Created**: 2026-07-28
**Database**: SQLite (better-sqlite3)

---

## Entity Relationship

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────┐
│    Admin     │       │   SiteConfig     │       │  PortfolioItem  │
├─────────────┤       ├──────────────────┤       ├─────────────────┤
│ id           │       │ id               │       │ id              │
│ username     │       │ avatar_path      │       │ title           │
│ password_hash│       │ background_path  │       │ description     │
│ created_at   │       │ bio              │       │ image_path      │
│ updated_at   │       │ site_title       │       │ sort_order      │
└─────────────┘       │ updated_at       │       │ created_at      │
      1               └──────────────────┘       │ updated_at      │
      │                      1                   └─────────────────┘
      │                      │
      └──────────────────────┘
        (单条记录 — 网站只有一个管理员
         和一份全局配置)
```

---

## Tables

### admin

网站的唯一管理员账号。

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 |
| username | TEXT | NOT NULL, UNIQUE | 登录用户名 |
| password_hash | TEXT | NOT NULL | bcrypt 哈希密码 |
| created_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 创建时间 |
| updated_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 最后更新时间 |

**Validation Rules**:
- username: 3-50 字符
- password (哈希前): 最少 8 字符（在创建/修改时验证）

**Seed Data**: 应用首次启动时检测无管理员记录则创建默认账号（通过环境变量 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 或首次设置向导）。

---

### site_config

网站全局展示配置，单条记录。

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键（固定为 1） |
| avatar_path | TEXT | NULLABLE | 头像图片相对路径 (e.g., `uploads/avatar/me.jpg`) |
| background_path | TEXT | NULLABLE | 背景图相对路径 |
| bio | TEXT | NULLABLE, max 2000 | 个人简介 (Markdown 格式) |
| site_title | TEXT | NOT NULL, DEFAULT '个人主页' | 网站标题 |
| updated_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 最后更新时间 |

**Validation Rules**:
- avatar_path: 如非空，必须为有效图片路径
- background_path: 如非空，必须为有效图片路径
- bio: 0-2000 字符
- site_title: 1-100 字符

---

### portfolio_item

作品集条目。

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 主键 |
| title | TEXT | NOT NULL, max 200 | 作品名称 |
| description | TEXT | NULLABLE, max 1000 | 作品描述 |
| image_path | TEXT | NOT NULL | 作品图片相对路径 |
| sort_order | INTEGER | NOT NULL, DEFAULT 0 | 排序序号（升序） |
| created_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 创建时间 |
| updated_at | TEXT | NOT NULL, DEFAULT (datetime('now')) | 最后更新时间 |

**Validation Rules**:
- title: 1-200 字符
- description: 0-1000 字符
- image_path: 必须为有效图片路径
- sort_order: 非负整数

**Indexes**:
- `idx_portfolio_sort` on `(sort_order ASC)` — 按排序查询

---

## State Transitions

### Admin Session
```
[未登录] ──(登录成功)──▶ [已登录]
[已登录] ──(登出/超时30min)──▶ [未登录]
[已登录] ──(5次登录失败)──▶ [锁定15min] ──(超时)──▶ [未登录]
```

### Portfolio Item
```
[创建] ──(上传图片+填写信息)──▶ [已发布]
[已发布] ──(编辑)──▶ [已发布]
[已发布] ──(删除)──▶ [已删除]
[已发布] ──(拖拽排序)──▶ [排序更新]
```

### Site Config
```
[首次设置] ──(保存)──▶ [已配置]
[已配置] ──(修改)──▶ [已配置]
```

---

## Database Initialization

```sql
-- 应用启动时自动执行
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avatar_path TEXT,
    background_path TEXT,
    bio TEXT,
    site_title TEXT NOT NULL DEFAULT '个人主页',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS portfolio_item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_portfolio_sort ON portfolio_item(sort_order ASC);

-- 确保 site_config 有且仅有一条记录
INSERT OR IGNORE INTO site_config (id, site_title) VALUES (1, '个人主页');
```
