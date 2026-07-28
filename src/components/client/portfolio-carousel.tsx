"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";

export function PortfolioCarousel() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((res) => res.json() as Promise<{ data?: PortfolioItem[] }>)
      .then((data) => {
        if (data?.data) setItems(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (items.length === 0) return;
      setCurrent(((index % items.length) + items.length) % items.length);
    },
    [items.length]
  );

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  // Auto-play (pauses on hover)
  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length, paused]);

  // Loading state
  if (loading) {
    return (
      <div className="border border-[#111111] bg-[#F9F9F7] p-12 text-center">
        <div className="halftone-placeholder w-full h-64 mb-6 animate-pulse" />
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          加载中...
        </p>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="border border-[#111111] bg-[#F9F9F7] p-12 text-center">
        <div className="halftone-placeholder w-64 h-40 mx-auto mb-6" />
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          作品即将上线
        </p>
        <p className="font-body text-sm text-neutral-500 mt-2">
          精彩内容正在准备中，敬请期待
        </p>
      </div>
    );
  }

  const item = items[current];

  return (
    <div
      className="border border-[#111111] bg-[#F9F9F7]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-neutral-200 border-b border-[#111111]">
        {imageErrors.has(item.id) ? (
          <div className="w-full h-full halftone-placeholder flex items-center justify-center">
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
              图片加载失败
            </span>
          </div>
        ) : (
          <img
            src={`/${item.image_path}`}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImageErrors((prev) => new Set(prev).add(item.id))}
          />
        )}

        {/* Nav arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-[#F9F9F7] border border-r border-t border-b border-[#111111] hover:bg-neutral-100 transition-colors"
              aria-label="上一张"
            >
              <ChevronLeft size={24} strokeWidth={1.5} />
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-[#F9F9F7] border border-l border-t border-b border-[#111111] hover:bg-neutral-100 transition-colors"
              aria-label="下一张"
            >
              <ChevronRight size={24} strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {/* Info & Indicators */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-serif text-xl lg:text-2xl font-bold mb-2">
              {item.title}
            </h3>
            {item.description && (
              <p className="font-body text-sm text-neutral-600 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <span className="font-mono text-xs text-neutral-400 whitespace-nowrap">
            {String(current + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
        </div>

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`w-3 h-3 border border-[#111111] transition-colors duration-200 min-w-[12px] min-h-[12px] ${
                  index === current ? "bg-[#111111]" : "bg-transparent hover:bg-neutral-300"
                }`}
                aria-label={`第 ${index + 1} 张作品`}
                  aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
