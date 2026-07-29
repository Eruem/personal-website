import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { saveUpload } from "@/lib/upload";
import type { PortfolioItem } from "@/lib/types";

export const runtime = "edge";

// GET /api/portfolio — public
export async function GET() {
  const db = getDb();
  const result = await db
    .prepare("SELECT * FROM portfolio_item ORDER BY sort_order ASC")
    .all<PortfolioItem>();

  return NextResponse.json({ data: result.results });
}

// POST /api/portfolio — requires auth
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AuthError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw e;
  }

  const formData = await request.formData();
  const image = formData.get("image");
  const title = formData.get("title");
  const description = formData.get("description");
  const sortOrder = formData.get("sort_order");

  if (!image || !(image instanceof File) || image.size === 0) {
    return NextResponse.json({ error: "请上传作品图片" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "请输入作品名称" }, { status: 400 });
  }

  const result = await saveUpload(image, "portfolio");
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const db = getDb();
  const insertResult = await db
    .prepare(
      `INSERT INTO portfolio_item (title, description, image_path, sort_order)
       VALUES (?, ?, ?, ?)
       RETURNING *`
    )
    .bind(
      title.trim(),
      typeof description === "string" ? description.trim() || null : null,
      result.filePath,
      sortOrder ? parseInt(String(sortOrder), 10) || 0 : 0
    )
    .first<PortfolioItem>();

  return NextResponse.json(
    { data: insertResult, message: "作品已添加" },
    { status: 201 }
  );
}
