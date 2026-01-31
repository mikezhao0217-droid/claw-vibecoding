import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web编码竞赛仪表板",
  description: "跟踪各部门和团队的项目里程碑进度",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}