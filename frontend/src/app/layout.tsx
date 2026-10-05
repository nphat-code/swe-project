import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: "BrewLite — Đặt cà phê không dùng tiền mặt",
  description: "Ứng dụng đặt đồ uống trực tuyến không dùng tiền mặt BrewLite. Chọn món, chọn size, topping nhanh chóng và thanh toán tức thì.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-stone-950 text-stone-100">{children}</body>
    </html>
  );
}
