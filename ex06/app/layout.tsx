import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마이카마켓 · 중고차 매물",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
