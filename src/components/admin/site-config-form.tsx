"use client";

import { useState, useEffect, FormEvent } from "react";
import { ImageUpload } from "./image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Save } from "lucide-react";
import type { SiteConfig } from "@/lib/types";

export function SiteConfigForm() {
  const [config, setConfig] = useState<SiteConfig>({
    avatar_path: null,
    background_path: null,
    bio: null,
    site_title: "个人主页",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => res.json() as Promise<{ data?: SiteConfig }>)
      .then((data) => {
        if (data?.data) {
          setConfig(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData();
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    if (backgroundFile) {
      formData.append("background", backgroundFile);
    }
    formData.append("bio", config.bio || "");
    formData.append("site_title", config.site_title);

    try {
      const res = await fetch("/api/site-config", { method: "PUT", body: formData });
      const data = await res.json() as { data?: SiteConfig; error?: string };

      if (res.ok) {
        setMessage({ type: "success", text: "网站配置已保存" });
        setAvatarFile(null);
        setBackgroundFile(null);
        if (data?.data) {
          setConfig(data.data);
        }
      } else {
        setMessage({ type: "error", text: data.error || "保存失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误，请稍后重试" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">加载中...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <ImageUpload
        variant="avatar"
        currentPath={config.avatar_path}
        onFileChange={setAvatarFile}
      />

      <ImageUpload
        variant="background"
        currentPath={config.background_path}
        onFileChange={setBackgroundFile}
      />

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-neutral-600 mb-2">
          网站标题
        </label>
        <Input
          type="text"
          value={config.site_title}
          onChange={(e) => setConfig({ ...config, site_title: e.target.value })}
          className="w-full"
          maxLength={100}
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-neutral-600 mb-2">
          个人简介
        </label>
        <Textarea
          value={config.bio || ""}
          onChange={(e) => setConfig({ ...config, bio: e.target.value })}
          className="w-full"
          maxLength={2000}
          rows={5}
          placeholder="介绍一下自己..."
        />
        <p className="font-mono text-[10px] text-neutral-400 mt-1 text-right">
          {(config.bio || "").length}/2000
        </p>
      </div>

      {message && (
        <div
          className={`border p-3 ${
            message.type === "success"
              ? "border-[#111111] bg-neutral-100"
              : "border-[#CC0000] bg-[#F9F9F7]"
          }`}
        >
          <p
            className={`font-mono text-xs ${
              message.type === "success" ? "text-[#111111]" : "text-[#CC0000]"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <Button type="submit" disabled={saving}>
        <Save size={16} strokeWidth={1.5} />
        {saving ? "保存中..." : "保存配置"}
      </Button>
    </form>
  );
}
