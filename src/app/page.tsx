import { getPosts } from "@/lib/posts";
import { CATEGORIES, getCategory } from "@/lib/feeds";
import {
  FeaturedPost,
  PostCard,
  PostRow,
  SectionHeading,
} from "@/components/post-cards";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const activeCategory = categoria && getCategory(categoria) ? categoria : null;

  const posts = await getPosts({
    published: true,
    ...(activeCategory ? { category: activeCategory } : {}),
    limit: 30,
  });

  const [featured, ...rest] = posts;
  const grid = rest.slice(0, 4);
  const more = rest.slice(4);

  return (
    <div className="mx-auto w-full max-w-5xl px-5">
      <section className="pt-12 pb-10 sm:pt-16">
        {activeCategory ? (
          <>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Categoria
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {getCategory(activeCategory)?.label}
            </h1>
            <p className="mt-3 text-muted">
              {posts.length === 0
                ? "Nenhuma publicação nesta categoria ainda."
                : `${posts.length} ${posts.length === 1 ? "publicação" : "publicações"} nesta categoria.`}
            </p>
          </>
        ) : (
          <>
            <h1 className="max-w-3xl text-balance font-serif text-4xl leading-[1.08] tracking-tight sm:text-6xl">
              As notícias que importam,{" "}
              <em className="text-accent">sem ruído.</em>
            </h1>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted">
              {CATEGORIES.length} editorias acompanhadas em tempo real.
              Curadoria e redação automatizadas, sempre com link para a fonte
              original.
            </p>
          </>
        )}
      </section>

      {posts.length === 0 ? (
        <div className="mb-20 rounded-2xl border border-dashed border-border py-20 text-center text-muted">
          <p className="font-medium">Nenhum post por aqui ainda.</p>
          <p className="mt-1 text-sm">
            Publique pelo painel admin — manualmente ou com o robô.
          </p>
        </div>
      ) : (
        <div className="space-y-14 pb-20">
          <section className="space-y-6">
            <SectionHeading>Em destaque</SectionHeading>
            <FeaturedPost post={featured} />
          </section>

          {grid.length > 0 && (
            <section className="space-y-6">
              <SectionHeading>Últimas</SectionHeading>
              <div className="grid gap-5 sm:grid-cols-2">
                {grid.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {more.length > 0 && (
            <section className="space-y-2">
              <SectionHeading>Mais notícias</SectionHeading>
              <div className="divide-y divide-border">
                {more.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
