"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // Countdown timer for lockout — runs in useEffect, not in render
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!lockoutUntil || now >= lockoutUntil) return;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [lockoutUntil, now]);

  // Show lockout screen
  if (lockoutUntil && now < lockoutUntil) {
    const remaining = Math.ceil((lockoutUntil - now) / 1000);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return (
      <div className="text-center py-8">
        <Lock size={48} strokeWidth={1} className="mx-auto mb-4 text-[#CC0000]" />
        <p className="font-mono text-sm text-[#CC0000] uppercase tracking-widest mb-2">
          账号已锁定
        </p>
        <p className="font-mono text-xs text-neutral-500">
          请在 {mins} 分 {secs.toString().padStart(2, "0")} 秒后重试
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json() as { error?: string };

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else if (res.status === 429) {
        // Extract lockout duration
        const match = data.error?.match(/(\d+)/);
        const minutes = match ? parseInt(match[1]) : 15;
        setLockoutUntil(Date.now() + minutes * 60 * 1000);
        setError(data.error || "登录失败");
      } else {
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 border-2 border-[#111111] flex items-center justify-center mx-auto mb-4">
          <Lock size={28} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl font-black">管理端登录</h1>
        <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest mt-2">
          仅限网站所有者
        </p>
      </div>

      {error && (
        <div className="border border-[#CC0000] bg-[#F9F9F7] p-3">
          <p className="font-mono text-xs text-[#CC0000]">{error}</p>
        </div>
      )}

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-neutral-600 mb-1">
          用户名
        </label>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-neutral-600 mb-1">
          密码
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full"
        />
      </div>

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? "验证中..." : "登录"}
      </Button>
    </form>
  );
}
