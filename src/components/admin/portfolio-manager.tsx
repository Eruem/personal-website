"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";
import { Plus, Trash2, ChevronUp, ChevronDown, Edit3, X } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";

export function PortfolioManager() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addImage, setAddImage] = useState<File | null>(null);
  const [addError, setAddError] = useState("");

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json() as { data?: PortfolioItem[] };
      if (data?.data) setItems(data.data);
    } catch {
      // keep stale data on error
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setAddError("");

    if (!addImage) {
      setAddError("请选择作品图片");
      return;
    }
    if (!addTitle.trim()) {
      setAddError("请输入作品名称");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("image", addImage);
    formData.append("title", addTitle.trim());
    formData.append("description", addDesc.trim());
    formData.append("sort_order", String(items.length));

    const res = await fetch("/api/portfolio", { method: "POST", body: formData });
    const data = await res.json() as { error?: string };

    if (res.ok) {
      setShowAdd(false);
      setAddTitle("");
      setAddDesc("");
      setAddImage(null);
      setMessage({ type: "success", text: "作品已添加" });
      await loadItems();
    } else {
      setAddError(data.error || "添加失败");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除这个作品？")) return;

    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMessage({ type: "success", text: "作品已删除" });
      await loadItems();
    } else {
      const data = await res.json() as { error?: string };
      setMessage({ type: "error", text: data.error || "删除失败" });
    }
  }

  async function handleEdit(id: number) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (editingId === id) {
      // Save edit
      setSaving(true);
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDesc.trim());
      if (editImage) formData.append("image", editImage);

      const res = await fetch(`/api/portfolio/${id}`, { method: "PUT", body: formData });
      const data = await res.json() as { error?: string };

      if (res.ok) {
        setEditingId(null);
        setEditImage(null);
        setMessage({ type: "success", text: "作品已更新" });
        await loadItems();
      } else {
        setMessage({ type: "error", text: data.error || "更新失败" });
      }
      setSaving(false);
    } else {
      // Start editing
      setEditTitle(item.title);
      setEditDesc(item.description || "");
      setEditImage(null);
      setEditingId(id);
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    await saveReorder(newItems);
  }

  async function handleMoveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    await saveReorder(newItems);
  }

  async function saveReorder(reordered: PortfolioItem[]) {
    const payload = {
      items: reordered.map((item, idx) => ({ id: item.id, sort_order: idx })),
    };

    await fetch("/api/portfolio/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await loadItems();
  }

  if (loading) {
    return (
      <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 py-4">
        加载中...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
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

      {/* Items list */}
      {items.length === 0 && !showAdd ? (
        <div className="text-center py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 mb-4">
            暂无作品
          </p>
        </div>
      ) : (
        <div className="space-y-0 border border-[#111111]">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 ${
                index < items.length - 1 ? "border-b border-[#111111]" : ""
              }`}
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 border border-[#111111] overflow-hidden bg-neutral-200 flex-shrink-0">
                <img
                  src={`/${item.image_path}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info or Edit form */}
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full"
                    />
                    <Textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full"
                      rows={2}
                    />
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                      className="w-full text-xs"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-serif text-lg font-bold truncate">{item.title}</p>
                    {item.description && (
                      <p className="font-body text-sm text-neutral-500 truncate mt-1">
                        {item.description}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center border border-[#111111] hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                  aria-label="上移"
                >
                  <ChevronUp size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center border border-[#111111] hover:bg-neutral-100 disabled:opacity-30 transition-colors"
                  aria-label="下移"
                >
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => handleEdit(item.id)}
                  disabled={saving}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center border border-[#111111] hover:bg-neutral-100 transition-colors"
                  aria-label={editingId === item.id ? "保存" : "编辑"}
                >
                  {editingId === item.id ? (
                    <span className="font-mono text-[10px]">OK</span>
                  ) : (
                    <Edit3 size={14} strokeWidth={1.5} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="min-h-[32px] min-w-[32px] flex items-center justify-center border border-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-colors"
                  aria-label="删除"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="border border-[#111111] p-4 space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
            添加作品
          </p>

          <Input
            type="text"
            value={addTitle}
            onChange={(e) => setAddTitle(e.target.value)}
            placeholder="作品名称"
            className="w-full"
          />
          <Textarea
            value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)}
            placeholder="作品描述（可选）"
            className="w-full"
            rows={2}
          />
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setAddImage(e.target.files?.[0] || null)}
            className="w-full text-xs"
            required
          />

          {addError && (
            <p className="font-mono text-xs text-[#CC0000]">{addError}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              <Plus size={14} strokeWidth={1.5} />
              {saving ? "添加中..." : "确认添加"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>
              <X size={14} strokeWidth={1.5} />
              取消
            </Button>
          </div>
        </form>
      )}

      {/* Add button */}
      {!showAdd && (
        <Button onClick={() => setShowAdd(true)}>
          <Plus size={16} strokeWidth={1.5} />
          添加作品
        </Button>
      )}
    </div>
  );
}
