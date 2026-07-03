import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pulso — notícias em tempo real",
    template: "%s · Pulso",
  },
  description:
    "Blog minimalista com as notícias mais relevantes, selecionadas e redigidas automaticamente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-5">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight hover:text-accent transition-colors"
            >
              Pulso<span className="text-accent">.</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <Link href="/" className="hover:text-foreground transition-colors">
                Início
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        <footer className="border-t border-border">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6 text-xs text-muted">
            <span>© {new Date().getFullYear()} Pulso</span>
            <span>Conteúdo selecionado e redigido com apoio de IA</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
