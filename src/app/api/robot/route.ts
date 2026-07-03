import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { runRobot } from "@/lib/robot";

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { category } = await request.json().catch(() => ({}));
  if (!category || typeof category !== "string") {
    return NextResponse.json(
      { error: "Selecione uma categoria." },
      { status: 400 }
    );
  }

  try {
    const post = await runRobot(category);
    return NextResponse.json({ ok: true, slug: post.slug, title: post.title });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro inesperado no robô.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
