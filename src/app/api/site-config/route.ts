import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { buildUpdateQuery } from "@/lib/db-helpers";
import { saveUpload, deleteUpload } from "@/lib/upload";
import type { SiteConfig } from "@/lib/types";

export const runtime = "edge";

// GET /api/site-config — public
export async function GET() {
  const db = getDb();
  const result = await db
    .prepare("SELECT * FROM site_config WHERE id = 1")
    .all<SiteConfig>();

  const config = result.results[0];

  return NextResponse.json({
    data: config || {
      avatar_path: null,
      background_path: null,
      bio: null,
      site_title: "个人主页",
    },
  });
}

// PUT /api/site-config — requires auth
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AuthError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }

  const db = getDb();
  const formData = await request.formData();

  const currentResult = await db
    .prepare("SELECT * FROM site_config WHERE id = 1")
    .all<SiteConfig>();
  const current = currentResult.results[0];

  const updates: Record<string, string | number | null> = {};
  const errors: string[] = [];

  // Handle avatar upload
  const avatar = formData.get("avatar");
  if (avatar && avatar instanceof File && avatar.size > 0) {
    const result = await saveUpload(avatar, "avatar");
    if (result.success) {
      updates.avatar_path = result.filePath;
      if (current?.avatar_path) {
        await deleteUpload(current.avatar_path);
      }
    } else {
      errors.push(result.error);
    }
  }

  // Handle background upload
  const background = formData.get("background");
  if (background && background instanceof File && background.size > 0) {
    const result = await saveUpload(background, "background");
    if (result.success) {
      updates.background_path = result.filePath;
      if (current?.background_path) {
        await deleteUpload(current.background_path);
      }
    } else {
      errors.push(result.error);
    }
  }

  // Handle text fields
  const bio = formData.get("bio");
  if (bio !== null && typeof bio === "string") {
    updates.bio = bio;
  }

  const siteTitle = formData.get("site_title");
  if (siteTitle !== null && typeof siteTitle === "string") {
    updates.site_title = siteTitle;
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  if (Object.keys(updates).length > 0) {
    const { sql, values } = buildUpdateQuery("site_config", updates, "id", "1");
    await db.prepare(sql).bind(...values).run();
  }

  const updatedResult = await db
    .prepare("SELECT * FROM site_config WHERE id = 1")
    .all<SiteConfig>();

  return NextResponse.json({
    data: updatedResult.results[0],
    message: "网站配置已更新",
  });
}
