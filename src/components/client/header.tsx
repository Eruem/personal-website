"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date();
  const dateStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#111111] bg-[#F9F9F7]">
      {/* Edition metadata bar */}
      <div className="border-b border-[#111111] bg-[#111111] text-[#F9F9F7] px-4 py-1 overflow-hidden">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
          <span>Vol. 1</span>
          <span className="hidden sm:block">{dateStr}</span>
          <span className="hidden md:block">个人主页 · Edition</span>
          <span>Printed in Digital</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="font-serif text-2xl font-black tracking-tight hover:text-[#CC0000] transition-colors"
          >
            个人主页
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#portfolio"
              className="font-mono text-xs uppercase tracking-widest text-neutral-600 hover:text-[#CC0000] transition-colors"
            >
              作品
            </Link>
            <Link
              href="#about"
              className="font-mono text-xs uppercase tracking-widest text-neutral-600 hover:text-[#CC0000] transition-colors"
            >
              关于
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#111111]"
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
          >
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t border-[#111111] py-4 flex flex-col gap-4">
            <Link
              href="#portfolio"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-xs uppercase tracking-widest hover:text-[#CC0000] transition-colors px-2"
            >
              作品
            </Link>
            <Link
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="font-mono text-xs uppercase tracking-widest hover:text-[#CC0000] transition-colors px-2"
            >
              关于
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
