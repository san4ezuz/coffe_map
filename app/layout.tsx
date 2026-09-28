import type { Metadata } from "next";
import { Spectral, Manrope } from "next/font/google";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme/theme-provider";
import "./globals.css";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mesta — карта мест Валенсии",
  description:
    "Карта мест, открытых русскоязычными предпринимателями в Валенсии: кофейни, рестораны, услуги.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${spectral.variable} ${manrope.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="h-full flex flex-col antialiased" suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
