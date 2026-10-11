import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Block Blast",
  description: "Game xếp khối puzzle",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}