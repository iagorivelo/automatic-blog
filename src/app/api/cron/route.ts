import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/feeds";
import { getRobotCategoriesSince } from "@/lib/posts";
import { runRobot } from "@/lib/robot";

// Acionado a cada 30 min por um cron externo (GitHub Actions em .github/workflows,
// ou o cron da Vercel no plano Pro com "*/30 * * * *"). Não usa setInterval porque
// em serverless não há processo contínuo.
//
// Lógica idempotente por dia: cada chamada publica a PRÓXIMA categoria que ainda
// não saiu hoje. Quando todas já saíram, as chamadas seguintes não fazem nada até
// o dia virar. Assim: 1 post a cada 30 min → todas as categorias ao longo do dia
// → no dia seguinte recomeça sozinho.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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

  const done = new Set(await getRobotCategoriesSince(startOfTodayBRT()));
  const next = CATEGORIES.find((c) => !done.has(c.slug));

  if (!next) {
    return NextResponse.json({
      ok: true,
      done: true,
      message: "Todas as categorias já foram publicadas hoje.",
    });
  }

  try {
    const post = await runRobot(next.slug);
    return NextResponse.json({
      ok: true,
      category: next.slug,
      slug: post.slug,
      title: post.title,
      remaining: CATEGORIES.length - done.size - 1,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado no robô.";
    return NextResponse.json(
      { ok: false, category: next.slug, error: message },
      { status: 500 }
    );
  }
}
