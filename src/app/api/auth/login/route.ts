import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json(
      { error: "Credenciais de admin não configuradas no servidor." },
      { status: 500 }
    );
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 }
    );
  }

  await createSession(email);
  return NextResponse.json({ ok: true });
}
