import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/feeds";
import { getRobotCategoriesSince } from "@/lib/posts";
import { runRobot } from "@/lib/robot";

// Acionado a cada 30 min por um cron externo (GitHub Actions em .github/workflows,
// ou o cron da Vercel no plano Pro com "*/30 * * * *"). Não usa setInterval porque
// em serverless não há processo contínuo.
//
// Meta diária: TARGET_PER_CATEGORY posts de CADA categoria. A cada chamada,
// publica a categoria MENOS atendida hoje (distribuição round-robin) que ainda
// não bateu a meta. Quando todas bateram, as chamadas seguintes não fazem nada
// até o dia virar (meia-noite BRT). Idempotente por dia → recomeça sozinho.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const TARGET_PER_CATEGORY = 3;
// Se a categoria escolhida não tiver notícia nova agora, tenta a próxima na fila
// (limitado para respeitar o teto de 60s da função no plano Hobby).
const MAX_ATTEMPTS = 3;

// Horário de Brasília é UTC-3 fixo (o Brasil não adota horário de verão desde 2019)
const BRT_OFFSET_MS = -3 * 60 * 60 * 1000;

/** Início do dia de hoje em horário de Brasília, como ISO em UTC */
function startOfTodayBRT(): string {
  const brtNow = Date.now() + BRT_OFFSET_MS;
  const brtMidnight = Math.floor(brtNow / 86_400_000) * 86_400_000;
  return new Date(brtMidnight - BRT_OFFSET_MS).toISOString();
}

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // O cron (Vercel ou GitHub Actions) envia este header
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // Conta quantos posts cada categoria já teve hoje
  const publishedToday = await getRobotCategoriesSince(startOfTodayBRT());
  const counts = new Map(CATEGORIES.map((c) => [c.slug, 0]));
  for (const slug of publishedToday) {
    if (counts.has(slug)) counts.set(slug, counts.get(slug)! + 1);
  }

  // Categorias abaixo da meta, das menos atendidas para as mais (round-robin);
  // empate mantém a ordem de CATEGORIES (Array.sort é estável)
  const candidates = CATEGORIES.filter(
    (c) => counts.get(c.slug)! < TARGET_PER_CATEGORY
  ).sort((a, b) => counts.get(a.slug)! - counts.get(b.slug)!);

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      done: true,
      message: `Meta de ${TARGET_PER_CATEGORY} posts por categoria já atingida hoje.`,
    });
  }

  const errors: { category: string; error: string }[] = [];
  for (const category of candidates.slice(0, MAX_ATTEMPTS)) {
    try {
      const post = await runRobot(category.slug);
      return NextResponse.json({
        ok: true,
        category: category.slug,
        slug: post.slug,
        title: post.title,
        countToday: counts.get(category.slug)! + 1,
        target: TARGET_PER_CATEGORY,
      });
    } catch (error) {
      // Provável falta de notícia nova nessa categoria agora — tenta a próxima
      errors.push({
        category: category.slug,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json(
    { ok: false, message: "Nenhuma categoria tinha notícia nova agora.", tried: errors },
    { status: 500 }
  );
}
