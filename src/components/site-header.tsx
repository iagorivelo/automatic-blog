import Link from "next/link";
import { Suspense } from "react";
import { CATEGORIES } from "@/lib/feeds";
import { CategoryNav } from "./category-nav";

function todayLong(): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2" aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

export function SiteHeader() {
  const categories = CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }));

  return (
    <>
      <div className="hidden border-b border-border/70 bg-surface sm:block">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-2 text-xs text-muted">
          <span>{todayLong()}</span>
          <span className="flex items-center gap-2">
            <LiveDot />
            Redação automatizada, atualizada ao longo do dia
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-5xl px-5">
          <div className="flex h-14 items-center justify-between gap-6">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight transition-colors hover:text-accent"
            >
              Pulso<span className="text-accent">.</span>
            </Link>
            <p className="hidden text-sm text-muted md:block">
              As notícias que importam, sem ruído
            </p>
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="mx-auto w-full max-w-5xl px-5">
            <Suspense fallback={<div className="h-11" />}>
              <CategoryNav categories={categories} />
            </Suspense>
          </div>
        </div>
      </header>
    </>
  );
}
