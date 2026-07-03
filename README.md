# Pulso — blog com robô de notícias

Blog moderno e minimalista em **Next.js + Tailwind + SQLite (Prisma)**. Leitores acessam sem login; admins entram em `/admin` para criar posts manualmente ou apertar **INICIAR** — o robô busca as últimas notícias da categoria escolhida em feeds RSS, seleciona a melhor com o **Google Gemini (gratuito)**, redige um post completo em Markdown e publica automaticamente.

## Como rodar

1. **Instale as dependências** (já instaladas se você recebeu o projeto pronto):

   ```bash
   npm install
   npx prisma db push
   ```

2. **Configure o `.env`** (use o `.env.example` como base):

   | Variável | O que é |
   | --- | --- |
   | `DATABASE_URL` | Caminho do SQLite (padrão já funciona) |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciais de login do admin |
   | `AUTH_SECRET` | String aleatória longa para assinar a sessão |
   | `GEMINI_API_KEY` | Chave **gratuita** — crie em <https://aistudio.google.com/apikey> |

3. **Suba o servidor**:

   ```bash
   npm run dev
   ```

   Blog: <http://localhost:3000> · Admin: <http://localhost:3000/admin>

## Como o robô funciona

1. Você escolhe a categoria no painel e clica em **INICIAR**.
2. O robô lê os feeds RSS da categoria (`src/lib/feeds.ts`) e junta as notícias das últimas 72h.
3. Descarta notícias que já viraram post (dedupe por URL da fonte).
4. Envia a lista para o `gemini-2.5-flash`, que escolhe a melhor notícia e redige um post completo (título, resumo, corpo em Markdown e tags) com saída JSON estruturada.
5. O post é salvo e publicado na hora, com link para a fonte original no rodapé.

Para adicionar categorias ou fontes, edite `src/lib/feeds.ts` — qualquer feed RSS funciona.

## Modo automático (sem clicar em nada)

Com `ROBOT_AUTO="true"` no `.env`, o robô roda sozinho enquanto o servidor estiver no ar: a cada `ROBOT_INTERVAL_MINUTES` minutos (padrão 30, mínimo 5) ele processa **uma categoria por vez, em rodízio**, e publica se houver notícia nova. O botão INICIAR continua funcionando para execuções manuais.

Sugestão de cadência (o rodízio passa por 6 categorias):

| Intervalo | Posts por dia (máx.) | Perfil |
| --- | --- | --- |
| 30 min | ~48 | Blog bem movimentado |
| 60 min | ~24 | Equilíbrio (bom padrão) |
| 120 min | ~12 | Curadoria enxuta |

O dedupe por URL da fonte impede posts repetidos — se não houver notícia nova na categoria da vez, o robô só registra no log e espera o próximo ciclo. Em hospedagens serverless (ex.: Vercel), processos não ficam vivos entre requisições: use um cron da plataforma chamando `POST /api/robot` no lugar do agendador interno.

## Estrutura

```
prisma/schema.prisma      → modelo Post (SQLite)
src/lib/feeds.ts          → categorias e feeds RSS
src/lib/robot.ts          → pipeline do robô (RSS → Gemini → publicação)
src/lib/auth.ts           → sessão do admin (JWT em cookie httpOnly)
src/middleware.ts         → proteção das rotas /admin
src/app/page.tsx          → home pública com filtro por categoria
src/app/post/[slug]/      → página do post (Markdown renderizado)
src/app/admin/            → painel: robô, novo post, publicar/excluir
src/app/api/              → login/logout, robô, CRUD de posts
```
