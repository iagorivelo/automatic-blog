import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, getCategory } from "@/lib/feeds";
import { formatDate, readingTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const activeCategory = categoria && getCategory(categoria) ? categoria : null;

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(activeCategory ? { category: activeCategory } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-5">
      <section className="pt-14 pb-10">
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          As notícias que importam,
          <br />
          <span className="text-muted">sem ruído.</span>
        </h1>
      </section>

      <nav className="flex flex-wrap gap-2 pb-10" aria-label="Categorias">
        <CategoryPill href="/" label="Tudo" active={!activeCategory} />
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c.slug}
            href={`/?categoria=${c.slug}`}
            label={c.label}
            active={activeCategory === c.slug}
          />
        ))}
      </nav>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted mb-16">
          <p className="font-medium">Nenhum post por aqui ainda.</p>
          <p className="mt-1 text-sm">
            Publique pelo painel admin — manualmente ou com o robô.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border pb-16">
          {posts.map((post) => (
            <article key={post.id} className="group py-7 first:pt-0">
              <Link href={`/post/${post.slug}`} className="block">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="font-medium uppercase tracking-wider text-accent">
                    {getCategory(post.category)?.label ?? post.category}
                  </span>
                  <span>{formatDate(post.createdAt)}</span>
                  <span>·</span>
                  <span>{readingTime(post.content)} min de leitura</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background"
          : "rounded-full border border-border px-4 py-1.5 text-sm text-muted hover:border-foreground hover:text-foreground transition-colors"
      }
    >
      {label}
    </Link>
  );
}
