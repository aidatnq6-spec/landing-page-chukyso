import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "VI-TECH | Chữ ký số cho doanh nghiệp Việt",
  description:
    "Đăng ký mới và gia hạn chữ ký số ICA tại VI-TECH. Hỗ trợ trong suốt thời gian sử dụng. Hotline 0968.273.868.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
