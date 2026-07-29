import type { Metadata } from "next";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理端 - 个人主页",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F9F9F7] dot-grid-bg">
      {children}
    </div>
  );
}
