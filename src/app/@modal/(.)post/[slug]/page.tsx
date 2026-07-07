import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/posts";
import { getCategory } from "@/lib/feeds";
import { Modal } from "@/components/modal";
import { PostArticle } from "@/components/post-article";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PostModalPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) notFound();

  return (
    <Modal
      label={getCategory(post.category)?.label ?? post.category}
      fullHref={`/post/${post.slug}`}
    >
      <PostArticle post={post} variant="modal" />
    </Modal>
  );
}
