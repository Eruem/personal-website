# Tasks: 个人网站内容管理系统

**Input**: Design documents from `/specs/001-personal-website-cms/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅, quickstart.md ✅

**Tests**: Not explicitly requested — test tasks are omitted. Use quickstart.md scenarios for manual validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [x] T001 Create Next.js project with TypeScript, Tailwind CSS, App Router (src/ directory) per plan.md structure
- [x] T002 Install core dependencies: `better-sqlite3`, `bcryptjs`, `iron-session`, `lucide-react`, `class-variance-authority`, `tailwind-merge`
- [x] T003 [P] Configure `tailwind.config.ts` — extend theme with Newsprint colors (#F9F9F7, #111111, #E5E5E0, #CC0000), font families (Playfair Display, Lora, Inter, JetBrains Mono), zero border radius default
- [x] T004 [P] Create `src/styles/newsprint.css` — add `.sharp-corners`, `.newsprint-texture`, `.hard-shadow-hover` utility classes and dot-grid pattern SVG
- [x] T005 [P] Create environment variable template `.env.local` with ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET, DATABASE_PATH
- [x] T006 Create directory structure: `src/app/(client)/`, `src/app/(admin)/login/`, `src/app/(admin)/dashboard/`, `src/app/api/auth/login/`, `src/app/api/auth/logout/`, `src/app/api/auth/me/`, `src/app/api/site-config/`, `src/app/api/portfolio/`, `src/components/ui/`, `src/components/client/`, `src/components/admin/`, `src/lib/`, `data/`, `public/uploads/avatar/`, `public/uploads/background/`, `public/uploads/portfolio/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement database initialization in `src/lib/db.ts` — SQLite connection via better-sqlite3, create tables (admin, site_config, portfolio_item) with seed `INSERT OR IGNORE` for default admin (bcrypt hash password from env) and site_config (id=1)
- [x] T008 [P] Implement iron-session configuration in `src/lib/auth.ts` — cookie options (30min maxAge, httpOnly, secure in prod), SessionData interface, getSession helper
- [x] T009 [P] Implement file upload validation in `src/lib/upload.ts` — format whitelist (JPG/PNG/WebP), 10MB size limit, save to `public/uploads/`, generate unique filename
- [x] T010 [P] Create shared constants in `src/lib/constants.ts` — MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, MAX_LOGIN_ATTEMPTS, LOCK_DURATION_MINUTES, SESSION_MAX_AGE
- [x] T011 Implement authentication middleware in `src/middleware.ts` — check iron-session for all `/admin/*` routes (exclude `/admin/login`), redirect to login if unauthenticated
- [x] T012 [P] Create root layout in `src/app/layout.tsx` — Google Fonts @import (Playfair Display, Lora, Inter, JetBrains Mono), global metadata, body with Newsprint background (#F9F9F7) and dot-grid pattern
- [x] T013 [P] Create global stylesheet `src/app/globals.css` — @tailwind directives, body font-family, Newsprint CSS variables, image grayscale default and hover sepia effect
- [x] T014 [P] Create Button UI component in `src/components/ui/button.tsx` — cva variants (primary/secondary/ghost/link), sharp corners, uppercase tracking-widest, hard-shadow-hover, min-h-[44px] touch target
- [x] T015 [P] Create Card UI component in `src/components/ui/card.tsx` — 1px solid #111111 border, Newsprint bg (#F9F9F7), hard-shadow-hover on hover variant
- [x] T016 [P] Create Input UI component in `src/components/ui/input.tsx` — border-b-2 bottom-border only, transparent bg, monospace font, focus:bg-[#F0F0F0], zero radius
- [x] T017 [P] Create SectionHeader UI component in `src/components/ui/section-header.tsx` — Playfair Display serif font, massive sizing (text-4xl to 5xl), optional uppercase label with monospace
- [x] T018 [P] Create Divider UI component in `src/components/ui/divider.tsx` — horizontal rule variants (1px, 4px heavy), optional ornamental serif dividers (✦ ✦ ✦)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - 访问者浏览个人网站 (Priority: P1) 🎯 MVP

**Goal**: 任何访问者打开网站即可看到只读的个人展示页，包含头像、背景图、个人简介、网站标题

**Independent Test**: 访问 `http://localhost:3000/` 即可看到完整展示内容，无登录要求，无编辑入口

### Implementation for User Story 1

- [x] T019 [P] [US1] Create Header component in `src/components/client/header.tsx` — site title, navigation (锚点 to sections), border-b, sticky top, uppercase monospace labels, zero-radius
- [x] T020 [P] [US1] Create Footer component in `src/components/client/footer.tsx` — edition metadata (Vol. 1 | Date | Edition), copyright, social icon links (bordered boxes), thick border-t-4, monospace text-xs
- [x] T021 [P] [US1] Implement GET `/api/site-config` in `src/app/api/site-config/route.ts` — return avatar_path, background_path, bio, site_title from DB (public, no auth)
- [x] T022 [US1] Create (client) layout in `src/app/(client)/layout.tsx` — wraps Header + children + Footer, max-w-screen-xl mx-auto px-4
- [x] T023 [US1] Create HeroBanner component in `src/components/client/hero-banner.tsx` — fetch site-config via GET API, display background image (full-width, grayscale), avatar overlay (bordered box), site_title as h1 (Playfair Display, text-5xl → 9xl), bio as drop-cap paragraph (Lora, text-justify)
- [x] T024 [US1] Create client home page in `src/app/(client)/page.tsx` — compose HeroBanner + placeholder section for portfolio carousel (empty state: "作品即将上线"), SectionHeader dividers between sections
- [x] T025 [US1] Validate US1 independently — run quickstart.md Scenario 4 (client display verification)

**Checkpoint**: MVP ready — personal website publicly visible with avatar, background, bio

---

## Phase 4: User Story 2 - 管理员登录管理端 (Priority: P2)

**Goal**: 管理员通过独立登录页面输入账号密码，验证通过后进入管理端；错误凭据被拒绝，连续失败后账号锁定

**Independent Test**: 访问 `/admin/login`，输入正确凭据后进入 `/admin/dashboard`；错误凭据被拒绝；未登录直接访问 `/admin/dashboard` 被重定向

### Implementation for User Story 2

- [x] T026 [US2] Implement POST `/api/auth/login` in `src/app/api/auth/login/route.ts` — validate username/password against admin table (bcrypt compare), set iron-session, track failed attempts (in-memory Map with lockout), return 401/429 on failure
- [x] T027 [P] [US2] Implement POST `/api/auth/logout` in `src/app/api/auth/logout/route.ts` — destroy session cookie
- [x] T028 [P] [US2] Implement GET `/api/auth/me` in `src/app/api/auth/me/route.ts` — return current auth status from session
- [x] T029 [US2] Create LoginForm component in `src/components/admin/login-form.tsx` — username input (Input component), password input, submit Button, error message display, lockout countdown timer, uppercase labels, monospace inputs
- [x] T030 [US2] Create admin login page in `src/app/(admin)/login/page.tsx` — centered card layout, LoginForm, "管理端登录" heading (Playfair Display), no nav/footer
- [x] T031 [US2] Create (admin) layout in `src/app/(admin)/layout.tsx` — check auth via `/api/auth/me`, sidebar nav placeholder, admin-specific metadata
- [x] T032 [US2] Create dashboard placeholder page in `src/app/(admin)/dashboard/page.tsx` — "管理仪表盘" heading, site config form placeholder, logout button (calls `/api/auth/logout` then redirects)
- [x] T033 [US2] Validate US2 independently — run quickstart.md Scenario 1 (login success, error, lockout, session expiry, redirect)

**Checkpoint**: Admin login fully functional

---

## Phase 5: User Story 3 - 管理员修改网站内容 (Priority: P2)

**Goal**: 管理员登录后可在仪表盘修改头像、背景图、个人简介、网站标题，保存后客户端即时生效

**Independent Test**: 登录后上传新头像/背景图，修改简介，保存后刷新客户端首页验证更新

### Implementation for User Story 3

- [x] T034 [US3] Implement PUT `/api/site-config` in `src/app/api/site-config/route.ts` — parse multipart/form-data, validate files via upload.ts, delete old files on replace, partial update (only provided fields), save to DB
- [x] T035 [P] [US3] Create AvatarUpload component in `src/components/admin/avatar-upload.tsx` — image preview, file input (accept JPG/PNG/WebP), drag-and-drop zone, size validation error message, bordered preview box
- [x] T036 [P] [US3] Create BackgroundUpload component in `src/components/admin/background-upload.tsx` — same as AvatarUpload but for background, full-width preview
- [x] T037 [US3] Create SiteConfigForm component in `src/components/admin/site-config-form.tsx` — compose AvatarUpload + BackgroundUpload + bio textarea (monospace Input) + site_title Input, save Button calling PUT /api/site-config, success/error toast
- [x] T038 [US3] Update dashboard page in `src/app/(admin)/dashboard/page.tsx` — integrate SiteConfigForm, fetch current config for initial values, add section for portfolio management placeholder
- [x] T039 [US3] Validate US3 independently — run quickstart.md Scenario 2 (upload avatar, upload background, file size/format errors, verify client update)

**Checkpoint**: Admin can manage all site configuration content

---

## Phase 6: User Story 4 - 作品展示与图片轮播 (Priority: P3)

**Goal**: 访问者在客户端页面看到作品图片轮播（自动播放 + 手动切换），管理员在后台可增删改排作品

**Independent Test**: 管理端添加多个作品 → 客户端轮播自动播放；手动点击前后切换和指示器

### Implementation for User Story 4

- [x] T040 [P] [US4] Implement GET `/api/portfolio` in `src/app/api/portfolio/route.ts` — return all portfolio items ordered by sort_order ASC (public, no auth)
- [x] T041 [P] [US4] Implement POST `/api/portfolio` in `src/app/api/portfolio/route.ts` — parse multipart/form-data (image required, title required, description optional), validate image, save file, insert DB record
- [x] T042 [P] [US4] Implement PUT `/api/portfolio/[id]` in `src/app/api/portfolio/[id]/route.ts` — update title/description/sort_order, optional image replace (delete old file), validate ownership
- [x] T043 [P] [US4] Implement DELETE `/api/portfolio/[id]` in `src/app/api/portfolio/[id]/route.ts` — delete DB record and associated image file, return 404 if not found
- [x] T044 [P] [US4] Implement PUT `/api/portfolio/reorder` in `src/app/api/portfolio/reorder/route.ts` — batch update sort_order from JSON body `{ items: [{id, sort_order}] }`
- [x] T045 [US4] Create PortfolioCarousel component in `src/components/client/portfolio-carousel.tsx` — fetch from GET /api/portfolio, image carousel with auto-play (5s interval), left/right arrow buttons (Button ghost, 44px touch target), bottom dot indicators (clickable, current highlighted), grayscale images with hover sepia, empty state ("作品即将上线" with radial-dot pattern placeholder), image error fallback placeholder
- [x] T046 [US4] Update client home page in `src/app/(client)/page.tsx` — integrate PortfolioCarousel replacing placeholder, add ornamental divider between hero and portfolio sections
- [x] T047 [US4] Create PortfolioManager component in `src/components/admin/portfolio-manager.tsx` — list all items with thumbnail, add form (image upload + title + description), edit inline, delete with confirmation, drag-to-reorder (or up/down buttons calling reorder API)
- [x] T048 [US4] Update dashboard page in `src/app/(admin)/dashboard/page.tsx` — integrate PortfolioManager below SiteConfigForm
- [x] T049 [US4] Validate US4 independently — run quickstart.md Scenario 3 (add/edit/delete/reorder portfolio items, verify carousel on client side, empty state, error fallback)

**Checkpoint**: Portfolio carousel fully functional on client and admin sides

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T050 [P] Add responsive design adjustments — mobile grid collapse, border-r removal on mobile, typography scaling, full-width CTAs, hamburger menu for client nav
- [x] T051 [P] Add Newsprint visual enhancements — marquee ticker in header (Edition/Date), drop caps on first paragraph of bio, grayscale → sepia hover on all images, ornamental divider between sections
- [x] T052 [P] Add accessibility — focus-visible ring styles, aria-labels on icon buttons, alt text on all images, semantic HTML (header/nav/section/footer), keyboard navigation for carousel
- [x] T053 [P] Add loading states — skeleton placeholders for hero banner and carousel during data fetch
- [x] T054 Add error boundaries — client-side ErrorBoundary component for graceful degradation, API error toasts for admin operations
- [x] T055 Run full quickstart.md validation — verify all 5 scenarios end-to-end
- [x] T056 [P] Configure production build — next.config.ts (image domains if needed), package.json build script, verify `pnpm build` succeeds

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational — **MVP**
- **User Story 2 (Phase 4)**: Depends on Foundational — can parallel with US1
- **User Story 3 (Phase 5)**: Depends on US2 (auth + dashboard page) — admin content management needs login
- **User Story 4 (Phase 6)**: Depends on Foundational for client side, US2+US3 for admin side
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundational → independent (no other story needed)
- **US2 (P2)**: Foundational → independent (no US1 needed, adds admin login)
- **US3 (P2)**: US2 → US1 (admin modifies content → client sees it; but independently testable via API)
- **US4 (P3)**: US1 + US2 + US3 → (carousel on client side + manager on admin side)

### Within Each User Story

- Models/services already covered in Foundational (DB, auth, upload libs)
- API endpoints before UI components
- Components before page integration
- Each story complete and validated before moving to next

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can all run in parallel
- **Phase 2**: T007→T008 (both depend on T007 db.ts but can be developed together), T009, T010, T012, T013 can all run in parallel; T014-T018 all [P] can run in parallel
- **Phase 5**: T035, T036 can run in parallel
- **Phase 6**: T040, T041, T042, T043, T044 can all run in parallel (different route files)
- **Phase 7**: T050, T051, T052, T053, T056 can all run in parallel
- **Cross-phase**: US1 (Phase 3) and US2 (Phase 4) can partially overlap after Foundational

---

## Parallel Example: Phase 2 Foundational

```bash
# After T001-T006 (Setup) complete, launch in parallel:
Task: "T007 Implement database initialization in src/lib/db.ts"
Task: "T008 Implement iron-session configuration in src/lib/auth.ts"
Task: "T009 Implement file upload validation in src/lib/upload.ts"
Task: "T010 Create shared constants in src/lib/constants.ts"

# After T007-T010, launch UI components in parallel:
Task: "T012 Create root layout in src/app/layout.tsx"
Task: "T013 Create global stylesheet src/app/globals.css"
Task: "T014 Create Button UI component in src/components/ui/button.tsx"
Task: "T015 Create Card UI component in src/components/ui/card.tsx"
Task: "T016 Create Input UI component in src/components/ui/input.tsx"
Task: "T017 Create SectionHeader UI component in src/components/ui/section-header.tsx"
Task: "T018 Create Divider UI component in src/components/ui/divider.tsx"
```

---

## Parallel Example: Phase 6 User Story 4 API Routes

```bash
# Launch all portfolio API routes in parallel (different route.ts files):
Task: "T040 [US4] Implement GET /api/portfolio in src/app/api/portfolio/route.ts"
Task: "T041 [US4] Implement POST /api/portfolio in src/app/api/portfolio/route.ts"
Task: "T042 [US4] Implement PUT /api/portfolio/[id] in src/app/api/portfolio/[id]/route.ts"
Task: "T043 [US4] Implement DELETE /api/portfolio/[id] in src/app/api/portfolio/[id]/route.ts"
Task: "T044 [US4] Implement PUT /api/portfolio/reorder in src/app/api/portfolio/reorder/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T018) — **CRITICAL**
3. Complete Phase 3: User Story 1 (T019-T025)
4. **STOP and VALIDATE**: Test US1 independently — website is live and shows content
5. Deploy MVP: personal website publicly accessible

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy (MVP: website visible publicly!)
3. Add User Story 2 → Test → Deploy (Admin can log in)
4. Add User Story 3 → Test → Deploy (Admin can modify content)
5. Add User Story 4 → Test → Deploy (Portfolio carousel live)
6. Polish → Final release

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (client display)
   - Developer B: User Story 2 (admin login)
3. After US2: Developer B starts US3 (admin content)
4. After US1+US3: Both developers converge on US4 (portfolio)

---

## Notes

- [P] tasks = different files, no dependencies — can be executed in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Use quickstart.md scenarios for manual validation at each checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 56 tasks across 7 phases
