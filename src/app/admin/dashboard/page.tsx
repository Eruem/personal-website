"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SectionHeader } from "@/components/ui/section-header";
import { SiteConfigForm } from "@/components/admin/site-config-form";
import { PortfolioManager } from "@/components/admin/portfolio-manager";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json() as { data?: { username?: string } };
        if (data?.data?.username) {
          setUsername(data.data.username);
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
          加载中...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8 border border-[#111111] p-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-[#111111] flex items-center justify-center bg-[#111111] text-[#F9F9F7] font-mono text-xs">
            A
          </div>
          <div>
            <p className="font-serif text-xl font-bold">管理仪表盘</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              欢迎, {username}
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={16} strokeWidth={1.5} />
          登出
        </Button>
      </div>

      {/* Site Config Form */}
      <SectionHeader label="管理" heading="网站内容配置" />
      <div className="border border-[#111111] p-6">
        <SiteConfigForm />
      </div>

      <Divider variant="heavy" className="my-8" />

      {/* Portfolio Manager */}
      <SectionHeader label="作品" heading="作品集管理" />
      <div className="border border-[#111111] p-6">
        <PortfolioManager />
      </div>
    </div>
  );
}
