import { createClient } from "@supabase/supabase-js";

// Tipagem inline do schema — evita a necessidade de gerar tipos via CLI
type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category: string;
          tags: string;
          source_url: string | null;
          source_name: string | null;
          ai_generated: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          category: string;
          tags?: string;
          source_url?: string | null;
          source_name?: string | null;
          ai_generated?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const globalForSupabase = globalThis as unknown as {
  supabase?: ReturnType<typeof createClient<Database>>;
};

export const supabase =
  globalForSupabase.supabase ?? createClient<Database>(url, key);

if (process.env.NODE_ENV !== "production")
  globalForSupabase.supabase = supabase;

/** Tipo que espelha a tabela `posts` no Supabase (snake_case do DB → camelCase no app) */
export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  sourceUrl: string | null;
  sourceName: string | null;
  aiGenerated: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Converte uma row snake_case do Supabase para o tipo Post camelCase */
export function rowToPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    excerpt: row.excerpt as string,
    content: row.content as string,
    category: row.category as string,
    tags: (row.tags as string) ?? "",
    sourceUrl: (row.source_url as string) ?? null,
    sourceName: (row.source_name as string) ?? null,
    aiGenerated: row.ai_generated as boolean,
    published: row.published as boolean,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}
