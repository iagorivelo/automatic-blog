import { supabase, rowToPost, type Post } from "@/lib/supabase";
export type { Post } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

type GetPostsOptions = {
  published?: boolean;
  category?: string;
  limit?: number;
};

export async function getPosts(opts: GetPostsOptions = {}): Promise<Post[]> {
  let query = supabase.from("posts").select("*");

  if (opts.published !== undefined) {
    query = query.eq("published", opts.published);
  }
  if (opts.category) {
    query = query.eq("category", opts.category);
  }

  query = query.order("created_at", { ascending: false });

  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPost(data) : null;
}

export async function getPostsBySourceUrls(
  urls: string[]
): Promise<Pick<Post, "sourceUrl">[]> {
  if (urls.length === 0) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase
    .from("posts")
    .select("source_url")
    .in("source_url", urls) as any);
  if (error) throw error;
  return ((data ?? []) as { source_url: string }[]).map((r) => ({
    sourceUrl: r.source_url,
  }));
}

/** Categorias que já tiveram post do robô criado desde `sinceIso` (para o cron diário) */
export async function getRobotCategoriesSince(
  sinceIso: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .eq("ai_generated", true)
    .gte("created_at", sinceIso);
  if (error) throw error;
  return ((data ?? []) as { category: string }[]).map((r) => r.category);
}

export async function getRelatedPosts(
  category: string,
  excludeId: string,
  limit: number
): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .eq("category", category)
    .neq("id", excludeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(rowToPost);
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

type CreatePostData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string;
  sourceUrl?: string | null;
  sourceName?: string | null;
  aiGenerated?: boolean;
  published?: boolean;
};

export async function createPost(input: CreatePostData): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      tags: input.tags ?? "",
      source_url: input.sourceUrl ?? null,
      source_name: input.sourceName ?? null,
      ai_generated: input.aiGenerated ?? false,
      published: input.published ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPost(data);
}

export async function updatePost(
  id: string,
  fields: Partial<{ published: boolean }>
): Promise<Post | null> {
  const mapped: { published?: boolean; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (fields.published !== undefined) mapped.published = fields.published;

  const { data, error } = await supabase
    .from("posts")
    .update(mapped)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPost(data) : null;
}

export async function deletePost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPost(data) : null;
}

export async function slugExists(slug: string): Promise<boolean> {
  const { data } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data !== null;
}
