"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";

export type UploadVariant = "avatar" | "background";

interface ImageUploadProps {
  variant: UploadVariant;
  currentPath: string | null;
  onFileChange: (file: File | null) => void;
}

const LABELS: Record<UploadVariant, string> = {
  avatar: "个人头像",
  background: "背景图片",
};

const PREVIEW_SIZES: Record<UploadVariant, string> = {
  avatar: "w-32 h-32",
  background: "w-full h-40",
};

export function ImageUpload({ variant, currentPath, onFileChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError("");

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("仅支持 JPG、PNG、WebP 格式");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`文件大小超过 ${MAX_FILE_SIZE / 1024 / 1024}MB 限制`);
      return;
    }

    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  }

  function handleRemove() {
    setPreview(null);
    onFileChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
  }

  const hasImage = !!(preview || currentPath);
  const previewSize = PREVIEW_SIZES[variant];

  return (
    <div>
      <label className="block font-mono text-xs uppercase tracking-widest text-neutral-600 mb-2">
        {LABELS[variant]}
      </label>

      {/* Preview */}
      <div className={`${previewSize} border border-[#111111] overflow-hidden bg-neutral-200 ${variant === "background" ? "mb-3" : ""}`}>
        {hasImage ? (
          <img
            src={preview || `/${currentPath}`}
            alt={`${LABELS[variant]}预览`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full halftone-placeholder flex items-center justify-center">
            <Upload size={variant === "avatar" ? 24 : 32} strokeWidth={1} className="text-neutral-400" />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className={variant === "avatar" ? "flex flex-col gap-2" : "flex gap-2"}>
        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          <Upload size={14} strokeWidth={1.5} />
          选择图片
        </Button>
        {hasImage && (
          <Button type="button" variant="ghost" onClick={handleRemove}>
            <X size={14} strokeWidth={1.5} />
            移除
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="font-mono text-xs text-[#CC0000] mt-2">{error}</p>}
    </div>
  );
}
