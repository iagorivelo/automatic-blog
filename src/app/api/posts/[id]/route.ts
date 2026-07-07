import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { updatePost, deletePost } from "@/lib/posts";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const post = await updatePost(id, { published: Boolean(body.published) });

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
  const deleted = await deletePost(id);

  if (!deleted) {
    return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
