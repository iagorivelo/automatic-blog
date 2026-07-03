import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getCategory } from "@/lib/feeds";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { title, excerpt, content, category, tags } = body as {
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    tags?: string;
  };

  if (!title?.trim() || !content?.trim() || !category) {
    return NextResponse.json(
      { error: "Título, conteúdo e categoria são obrigatórios." },
      { status: 400 }
    );
  }
  if (!getCategory(category)) {
    return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
  }

  const base = slugify(title) || "post";
  let slug = base;
  let n = 2;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() || content.trim().slice(0, 200),
      content: content.trim(),
      category,
      tags: tags?.trim() ?? "",
      published: true,
    },
  });

  return NextResponse.json({ ok: true, slug: post.slug });
}
