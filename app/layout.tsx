import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "현대오토에버 경영실적 대시보드",
  description: "현대오토에버 사업부문별 분기 경영실적 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
