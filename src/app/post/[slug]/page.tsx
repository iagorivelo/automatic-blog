import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/feeds";
import { formatDate, readingTime } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  const tags = post.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto w-full max-w-2xl px-5 pt-12 pb-20">
      <Link
        href="/"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Voltar
      </Link>

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="font-medium uppercase tracking-wider text-accent">
            {getCategory(post.category)?.label ?? post.category}
          </span>
          <span>{formatDate(post.createdAt)}</span>
          <span>·</span>
          <span>{readingTime(post.content)} min de leitura</span>
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          {post.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {post.excerpt}
        </p>
      </header>

      <div className="prose prose-zinc dark:prose-invert mt-10 max-w-none prose-headings:tracking-tight prose-a:text-accent">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {post.sourceUrl && (
        <aside className="mt-10 rounded-xl border border-border bg-surface p-5 text-sm">
          <p className="text-muted">
            {post.aiGenerated
              ? "Este post foi redigido automaticamente a partir de uma notícia de "
              : "Fonte: "}
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              {post.sourceName ?? "veículo original"}
            </a>
            .
          </p>
        </aside>
      )}
    </article>
  );
}
