import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth";

// Impede que o painel apareça em buscadores
function noindex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return noindex(NextResponse.next());
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await verifyToken(token) : false;

  if (!valid) {
    // Para quem não é admin, o painel "não existe": responde 404
    // em vez de redirecionar para o login (o que revelaria o caminho)
    return noindex(
      NextResponse.rewrite(new URL("/__rota-inexistente", request.url))
    );
  }

  return noindex(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*"],
};
