import type { Metadata } from "next";
import "./globals.css";
import "@/styles/newsprint.css";

export const metadata: Metadata = {
  title: "个人主页",
  description: "欢迎来到我的个人主页",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen dot-grid-bg">{children}</body>
    </html>
  );
}
