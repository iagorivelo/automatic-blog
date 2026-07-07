import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Post } from "@/lib/supabase";
import { getCategory } from "@/lib/feeds";
import { formatDate, readingTime } from "@/lib/utils";
import { ImageGallery } from "@/components/image-gallery";

type Props = {
  post: Post;
  variant?: "page" | "modal";
  /** Ações extras exibidas na linha de meta (ex.: copiar link) — só na página */
  actions?: React.ReactNode;
};

export function PostArticle({ post, variant = "page", actions }: Props) {
  const isModal = variant === "modal";
  const tags = post.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <article>
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            {!isModal && (
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                {getCategory(post.category)?.label ?? post.category}
              </span>
            )}
            <span className="whitespace-nowrap">
              {formatDate(post.createdAt)} · {readingTime(post.content)} min de
              leitura
            </span>
          </div>
          {actions}
        </div>
        <h1
          className={`mt-4 text-balance font-serif tracking-tight ${
            isModal
              ? "text-2xl leading-[1.15] sm:text-3xl"
              : "text-3xl leading-[1.1] sm:text-5xl"
          }`}
        >
          {post.title}
        </h1>
        <p
          className={`mt-4 text-pretty leading-relaxed text-muted ${
            isModal ? "text-base" : "text-lg"
          }`}
        >
          {post.excerpt}
        </p>
      </header>

      {post.images.length > 0 && (
        <ImageGallery images={post.images} alt={post.title} compact={isModal} />
      )}

      <div className="mt-8 h-px bg-border" aria-hidden />

      <div
        className={`prose prose-stone mt-8 max-w-none font-serif dark:prose-invert prose-headings:font-serif prose-headings:tracking-tight prose-a:text-accent prose-blockquote:border-accent ${
          isModal ? "" : "prose-lg"
        }`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      {tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
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
