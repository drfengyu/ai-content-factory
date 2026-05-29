import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 内容工厂",
  description:
    "一键生成小红书种草文案、抖音短视频脚本、公众号深度文章。AI 驱动，专业高效。",
  keywords: "AI写作, 小红书文案, 抖音脚本, 公众号文章, 内容生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={GeistSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
