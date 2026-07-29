import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { buildUpdateQuery } from "@/lib/db-helpers";
import { saveUpload, deleteUpload } from "@/lib/upload";
import type { PortfolioItem } from "@/lib/types";

export const runtime = "edge";

function unauthResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// PUT /api/portfolio/[id] — requires auth
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return unauthResponse();
  }

  const { id } = await params;
  const db = getDb();

  const existing = await db
    .prepare("SELECT * FROM portfolio_item WHERE id = ?")
    .bind(id)
    .first<PortfolioItem>();

  if (!existing) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  const formData = await request.formData();
  const updates: Record<string, string | number | null> = {};
  const errors: string[] = [];

  // Handle image replacement — save new before deleting old
  const image = formData.get("image");
  if (image && image instanceof File && image.size > 0) {
    const result = await saveUpload(image, "portfolio");
    if (result.success) {
      updates.image_path = result.filePath;
    } else {
      errors.push(result.error);
    }
  }

  const title = formData.get("title");
  if (title !== null && typeof title === "string") {
    updates.title = title.trim();
  }

  const description = formData.get("description");
  if (description !== null && typeof description === "string") {
    updates.description = description.trim() || null;
  }

  const sortOrder = formData.get("sort_order");
  if (sortOrder !== null) {
    updates.sort_order = parseInt(String(sortOrder), 10) || 0;
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  if (Object.keys(updates).length > 0) {
    const { sql, values } = buildUpdateQuery("portfolio_item", updates, "id", id);
    await db.prepare(sql).bind(...values).run();

    // Delete old image AFTER successful DB update
    if (updates.image_path && existing.image_path) {
      await deleteUpload(existing.image_path);
    }
  }

  const updated = await db
    .prepare("SELECT * FROM portfolio_item WHERE id = ?")
    .bind(id)
    .first<PortfolioItem>();

  return NextResponse.json({ data: updated, message: "作品已更新" });
}

// DELETE /api/portfolio/[id] — requires auth
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return unauthResponse();
  }

  const { id } = await params;
  const db = getDb();

  const item = await db
    .prepare("SELECT * FROM portfolio_item WHERE id = ?")
    .bind(id)
    .first<PortfolioItem>();

  if (!item) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  // Delete DB record first, then clean up file (best-effort)
  await db.prepare("DELETE FROM portfolio_item WHERE id = ?").bind(id).run();
  await deleteUpload(item.image_path);

  return NextResponse.json({ message: "作品已删除" });
}
