import Link from "next/link";
import { CATEGORIES } from "@/lib/feeds";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-12 sm:grid-cols-[1.6fr_1fr_1.2fr]">
        <div>
          <Link
            href="/"
            className="text-xl font-bold tracking-tight transition-colors hover:text-accent"
          >
            Pulso<span className="text-accent">.</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            As notícias que importam, sem ruído. Curadoria e redação
            automatizadas a partir dos principais veículos do país.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Categorias
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/?categoria=${c.slug}`}
                  className="text-foreground/80 transition-colors hover:text-accent"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            Sobre
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Cada post é selecionado e reescrito automaticamente por um robô a
            partir de feeds RSS, sempre com link para a fonte original. Nada de
            clickbait, nada de rolagem infinita.
          </p>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pulso. Alguns direitos reservados.</span>
          <span>Conteúdo selecionado e redigido com apoio de IA.</span>
        </div>
      </div>
    </footer>
  );
}
