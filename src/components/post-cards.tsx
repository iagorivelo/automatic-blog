import Link from "next/link";
import type { Post } from "@/lib/supabase";
import { getCategory } from "@/lib/feeds";
import { formatDate, readingTime } from "@/lib/utils";

function Kicker({ post }: { post: Post }) {
  return (
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
      {getCategory(post.category)?.label ?? post.category}
    </span>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <span className="text-xs text-muted">
      {formatDate(post.createdAt)} · {readingTime(post.content)} min de leitura
    </span>
  );
}

function Cover({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl bg-surface ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </div>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {children}
      </h2>
      <div className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

export function FeaturedPost({ post }: { post: Post }) {
  return (
    <article className="group animate-fade-up">
      <Link
        href={`/post/${post.slug}`}
        className="block rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5 sm:p-10"
      >
        {post.coverImage && (
          <Cover src={post.coverImage} className="mb-7 aspect-[16/8]" />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Kicker post={post} />
          <Meta post={post} />
        </div>
        <h2 className="mt-4 max-w-3xl text-balance font-serif text-3xl leading-[1.12] tracking-tight transition-colors group-hover:text-accent sm:text-[2.6rem]">
          {post.title}
        </h2>
        <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted line-clamp-3">
          {post.excerpt}
        </p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Ler agora
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
          </svg>
        </span>
      </Link>
    </article>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group animate-fade-up">
      <Link
        href={`/post/${post.slug}`}
        className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
      >
        {post.coverImage && (
          <Cover src={post.coverImage} className="mb-5 aspect-[16/9]" />
        )}
        <Kicker post={post} />
        <h3 className="mt-3 text-balance font-serif text-xl leading-snug tracking-tight transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-auto pt-5">
          <Meta post={post} />
        </div>
      </Link>
    </article>
  );
}

export function PostRow({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link
        href={`/post/${post.slug}`}
        className="flex items-center justify-between gap-4 py-5"
      >
        <div className="min-w-0">
          <Kicker post={post} />
          <h3 className="mt-1.5 font-medium leading-snug transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          <span className="mt-1.5 block text-xs text-muted">
            {formatDate(post.createdAt)}
          </span>
        </div>
        {post.coverImage && (
          <Cover
            src={post.coverImage}
            className="hidden aspect-[4/3] w-24 shrink-0 sm:block"
          />
        )}
      </Link>
    </article>
  );
}
