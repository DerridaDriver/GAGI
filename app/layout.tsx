import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GAGI 0.4 — General Artificial Gag Intelligence",
  description: "一个会保存匿名实验数据的中文笑话生成竞技场。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="site-nav-shell">
          <div className="site-nav">
            <Link className="site-nav-brand" href="/" aria-label="GAGI 首页">
              GAGI<span aria-hidden="true">.</span>
            </Link>
            <nav aria-label="主导航">
              <Link href="/">首页</Link>
              <Link href="/ask">自由提问</Link>
              <Link href="/arena">笑话竞技场</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
