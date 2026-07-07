import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import { PostArticle } from "@/components/post-article";
import { PostRow, SectionHeading } from "@/components/post-cards";
import { ReadingProgress } from "@/components/reading-progress";
import { CopyLink } from "@/components/copy-link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) notFound();

  const related = await getRelatedPosts(post.category, post.id, 3);

  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-10 pb-20">
      <ReadingProgress />

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 8H3M7 3.5 2.5 8 7 12.5" />
        </svg>
        Todas as notícias
      </Link>

      <div className="mt-8">
        <PostArticle post={post} actions={<CopyLink />} />
      </div>

      {related.length > 0 && (
        <section className="mt-16 space-y-2">
          <SectionHeading>Leia também</SectionHeading>
          <div className="divide-y divide-border">
            {related.map((p) => (
              <PostRow key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
