import type { Metadata } from "next";
import "./globals.css";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `${config.site.brand} — Консультант по питанию`,
  description:
    "Evidence-informed питание и персональное сопровождение. Без голодных диет, без чувства вины, без магических обещаний.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
