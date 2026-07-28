/**
 * File upload abstraction layer.
 *
 * - Cloudflare Workers / Pages: stores images as base64 in D1 image table
 * - Local Node.js (next dev): stores files to public/uploads/
 *
 * image_path 格式：
 *   生产: "api/image/{id}"   → 通过 /api/image/[id] 输出
 *   本地: "uploads/{subdir}/{filename}" → Next.js 静态文件服务
 */

import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "./constants";
import { getDb } from "./db";

export interface UploadResult {
  success: true;
  filePath: string;
  fileName: string;
}

export interface UploadError {
  success: false;
  error: string;
}

// ---- Environment Detection ----

function isCloudflare(): boolean {
  try {
    require("@cloudflare/next-on-pages");
    return true;
  } catch {
    return false;
  }
}

// ---- Cloudflare D1 backend ----

async function saveToD1(
  file: File,
  _subdir: "avatar" | "background" | "portfolio"
): Promise<UploadResult | UploadError> {
  const ext = file.name.split(".").pop() || "jpg";
  const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const mimeType = mimeMap[ext.toLowerCase()] || "image/jpeg";

  // Read file as base64
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const db = getDb();
  const result = await db
    .prepare("INSERT INTO image (data, mime_type) VALUES (?, ?) RETURNING id")
    .bind(base64, mimeType)
    .first<{ id: number }>();

  if (!result) {
    return { success: false, error: "图片保存失败" };
  }

  return {
    success: true,
    filePath: `api/image/${result.id}`,
    fileName: `${result.id}.${ext}`,
  };
}

async function deleteFromD1(filePath: string): Promise<void> {
  const match = filePath.match(/^api\/image\/(\d+)$/);
  if (!match) return;

  try {
    const db = getDb();
    await db.prepare("DELETE FROM image WHERE id = ?").bind(Number(match[1])).run();
  } catch {
    // Image may already be deleted — ignore
  }
}

// ---- Local filesystem backend ----

async function saveToLocal(
  file: File,
  subdir: "avatar" | "background" | "portfolio"
): Promise<UploadResult | UploadError> {
  const path = require("path") as typeof import("path");
  const fs = require("fs") as typeof import("fs");

  const ext = file.name.split(".").pop() || "jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const relativePath = `uploads/${subdir}/${uniqueName}`;
  const absoluteDir = path.join(process.cwd(), "public", relativePath);

  if (!fs.existsSync(path.dirname(absoluteDir))) {
    fs.mkdirSync(path.dirname(absoluteDir), { recursive: true });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(absoluteDir, buffer);

  return { success: true, filePath: relativePath, fileName: uniqueName };
}

async function deleteFromLocal(filePath: string): Promise<void> {
  if (!filePath || !filePath.startsWith("uploads/")) return;
  try {
    const path = require("path") as typeof import("path");
    const fs = require("fs") as typeof import("fs");
    const absolutePath = path.join(process.cwd(), "public", filePath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch {
    // File may already be deleted — ignore
  }
}

// ---- Public API ----

export async function saveUpload(
  file: File,
  subdir: "avatar" | "background" | "portfolio"
): Promise<UploadResult | UploadError> {
  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: `不支持的文件格式 (${file.type})，仅允许 JPG、PNG、WebP` };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）` };
  }

  if (isCloudflare()) {
    return saveToD1(file, subdir);
  }
  return saveToLocal(file, subdir);
}

export async function deleteUpload(filePath: string): Promise<void> {
  if (!filePath) return;

  if (filePath.startsWith("api/image/")) {
    return deleteFromD1(filePath);
  }
  return deleteFromLocal(filePath);
}
