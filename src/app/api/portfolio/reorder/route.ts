import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";

// PUT /api/portfolio/reorder — requires auth
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as { items: { id: number; sort_order: number }[] };
  const { items } = body;

  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "无效的排序数据" }, { status: 400 });
  }

  const db = getDb();
  const stmts = items.map((item) =>
    db
      .prepare(
        "UPDATE portfolio_item SET sort_order = ?, updated_at = datetime('now') WHERE id = ?"
      )
      .bind(item.sort_order, item.id)
  );
  await db.batch(stmts);

  return NextResponse.json({ message: "排序已更新" });
}
