"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/feeds";

export default function NewPostPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]?.slug ?? "");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, content, category, tags }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar o post.");
        return;
      }
      // Navegação "dura" de propósito: um router.push seria interceptado
      // pela rota @modal/(.)post e abriria o modal por cima do formulário
      window.location.assign(`/post/${data.slug}`);
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent transition-colors";

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      <Link
        href="/admin"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Painel
      </Link>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Novo post</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Título
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Título do post"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Categoria
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Tags{" "}
            <span className="font-normal text-muted">
              (separadas por vírgula)
            </span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={inputClass}
              placeholder="ia, tecnologia"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Resumo{" "}
          <span className="font-normal text-muted">
            (opcional — aparece na home)
          </span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Um parágrafo curto resumindo o post"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Conteúdo{" "}
          <span className="font-normal text-muted">(suporta Markdown)</span>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className={`${inputClass} font-mono text-xs leading-relaxed`}
            placeholder={"## Subtítulo\n\nEscreva o conteúdo aqui…"}
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-lg bg-accent px-8 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong disabled:opacity-60 transition-colors"
        >
          {saving ? "Publicando…" : "Publicar"}
        </button>
      </form>
    </div>
  );
}
