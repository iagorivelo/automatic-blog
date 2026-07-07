"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  categories: { slug: string; label: string }[];
  auto: { enabled: boolean; intervalMinutes: number; cron?: boolean };
};

export function RobotPanel({ categories, auto }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ slug: string; title: string } | null>(
    null
  );

  async function start() {
    setRunning(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/robot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro inesperado no robô.");
        return;
      }
      setSuccess({ slug: data.slug, title: data.title });
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          {running && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
              running ? "bg-accent" : "bg-border"
            }`}
          />
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Robô de notícias
        </h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        Escolha uma categoria e clique em iniciar: o robô pesquisa as últimas
        notícias, seleciona a melhor, redige um post completo e publica no
        blog.
      </p>

      <p className="mt-3 flex items-center gap-2 text-xs">
        {auto.cron ? (
          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">
            Modo automático ativo via cron — publica 3 posts de cada categoria
            por dia (~18/dia), espaçados ao longo do dia, sem precisar clicar
          </span>
        ) : auto.enabled ? (
          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-medium text-accent">
            Modo automático ativo — uma categoria a cada{" "}
            {auto.intervalMinutes} min, sem precisar clicar
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-600 dark:text-amber-400">
            Modo automático desativado — defina ROBOT_AUTO=&quot;true&quot;
            (local) ou CRON_SECRET (Vercel)
          </span>
        )}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={running}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>

        <button
          onClick={start}
          disabled={running}
          className="rounded-lg bg-accent px-8 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-accent-strong disabled:opacity-60 transition-colors"
        >
          {running ? "Trabalhando…" : "Iniciar"}
        </button>
      </div>

      {running && (
        <p className="mt-4 animate-pulse text-sm text-muted">
          O robô está pesquisando as últimas notícias e redigindo o post. Isso
          pode levar até um minuto…
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-4 rounded-lg bg-accent/10 px-3 py-2 text-sm">
          Post publicado:{" "}
          <a
            href={`/post/${success.slug}`}
            className="font-medium text-accent hover:underline"
          >
            {success.title}
          </a>
        </p>
      )}
    </section>
  );
}
