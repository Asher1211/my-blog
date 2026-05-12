import type { Metadata } from "next";
import { JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ParticleBackground from "@/components/common/ParticleBackground";
import DeskPet from "@/components/pet/DeskPet";
import CustomCursor from "@/components/common/CustomCursor";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "数字档案馆 | 学习记录博客",
    template: "%s | 数字档案馆",
  },
  description: "以学习记录为核心的个人博客，AI 加持的知识库式阅读体验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${playfair.variable} ${jetbrainsMono.variable} antialiased relative`}>
        <ParticleBackground />
        <Header />
        <main className="relative z-10 min-h-[calc(100vh-10rem)]">
          {children}
        </main>
        <Footer />
        <DeskPet />
        <CustomCursor />
      </body>
    </html>
  );
}
