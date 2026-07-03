import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const post = await prisma.post
    .update({
      where: { id },
      data: { published: Boolean(body.published) },
    })
    .catch(() => null);

  if (!post) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.post.delete({ where: { id } }).catch(() => null);

  if (!deleted) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
