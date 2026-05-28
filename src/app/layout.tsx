import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 内容工厂 - 小红书/抖音/公众号爆款生成",
  description: "一键生成小红书种草文案、抖音短视频脚本、公众号深度文章。AI 驱动，专业高效。",
  keywords: "AI写作, 小红书文案, 抖音脚本, 公众号文章, 内容生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
