import Link from "next/link";
import { connection } from "next/server";

// Sem isso a rota 404 seria pré-renderizada no build e congelaria a
// data "hoje" exibida no topo do site (todas as outras rotas são dinâmicas)
export default async function NotFound() {
  await connection();
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-start px-5 py-24">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        Erro 404
      </p>
      <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Página não encontrada.
      </h1>
      <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted">
        O endereço pode ter mudado ou a publicação foi removida. As notícias de
        hoje continuam na página inicial.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
