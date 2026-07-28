import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface ImageRow {
  id: number;
  data: string;
  mime_type: string;
}

/**
 * GET /api/image/[id] — serve base64 images stored in D1 image table.
 * Public endpoint (no auth required).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  try {
    const image = await db
      .prepare("SELECT data, mime_type FROM image WHERE id = ?")
      .bind(Number(id))
      .first<ImageRow>();

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const buffer = Buffer.from(image.data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": image.mime_type,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}
