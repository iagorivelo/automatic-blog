"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Category = { slug: string; label: string };

export function CategoryNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onHome = pathname === "/";
  const active = onHome ? searchParams.get("categoria") : null;

  const items = [
    { slug: null as string | null, label: "Tudo", href: "/" },
    ...categories.map((c) => ({
      slug: c.slug as string | null,
      label: c.label,
      href: `/?categoria=${c.slug}`,
    })),
  ];

  return (
    <nav aria-label="Categorias" className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const isActive = onHome && active === item.slug;
          return (
            <li key={item.label} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative block whitespace-nowrap px-3 py-3 text-sm transition-colors ${
                  isActive
                    ? "font-medium text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
