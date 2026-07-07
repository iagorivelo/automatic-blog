import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { CATEGORIES, getCategory } from "@/lib/feeds";
import { formatDate } from "@/lib/utils";
import { RobotPanel } from "./RobotPanel";
import { PostActions, LogoutButton } from "./actions-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const posts = await getPosts({ limit: 50 });

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel</h1>
          <p className="mt-1 text-sm text-muted">
            Gerencie publicações e acione o robô.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/novo"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-foreground transition-colors"
          >
            + Novo post
          </Link>
          <LogoutButton />
        </div>
      </div>

      <RobotPanel
        categories={CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }))}
        auto={{
          enabled: process.env.ROBOT_AUTO === "true",
          intervalMinutes: Math.max(
            5,
            Number(process.env.ROBOT_INTERVAL_MINUTES) || 60
          ),
          cron: Boolean(process.env.CRON_SECRET),
        }}
      />

      <section className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Publicações ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
            Nenhum post ainda. Use o robô acima ou crie um manualmente.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="uppercase tracking-wider text-accent">
                      {getCategory(post.category)?.label ?? post.category}
                    </span>
                    <span>{formatDate(post.createdAt)}</span>
                    {post.aiGenerated && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 font-medium text-accent">
                        robô
                      </span>
                    )}
                    {!post.published && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">
                        rascunho
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/post/${post.slug}`}
                    className="mt-1 block truncate text-sm font-medium hover:text-accent transition-colors"
                  >
                    {post.title}
                  </Link>
                </div>
                <PostActions id={post.id} published={post.published} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
