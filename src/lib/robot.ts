import Parser from "rss-parser";
import { GoogleGenAI, Type, type GenerateContentConfig } from "@google/genai";
import { prisma } from "@/lib/prisma";
import { getCategory } from "@/lib/feeds";
import { slugify } from "@/lib/utils";
import type { Post } from "@prisma/client";

type NewsItem = {
  title: string;
  link: string;
  snippet: string;
  pubDate: Date | null;
  sourceName: string;
};

const MAX_ITEMS = 15;
const MAX_AGE_HOURS = 72;

async function fetchNews(categorySlug: string): Promise<NewsItem[]> {
  const category = getCategory(categorySlug);
  if (!category) throw new Error(`Categoria inválida: ${categorySlug}`);

  // Busca com fetch nativo (o cliente HTTP do rss-parser não descomprime
  // respostas gzip, que alguns veículos como o G1 sempre enviam)
  const parser = new Parser();
  const results = await Promise.allSettled(
    category.feeds.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} em ${feed.url}`);
      const parsed = await parser.parseString(await res.text());
      return (parsed.items ?? []).map(
        (item): NewsItem => ({
          title: item.title?.trim() ?? "",
          link: item.link?.trim() ?? "",
          snippet: (item.contentSnippet ?? item.content ?? "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 400),
          pubDate: item.isoDate ? new Date(item.isoDate) : null,
          sourceName: feed.name,
        })
      );
    })
  );

  const items = results
    .filter(
      (r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled"
    )
    .flatMap((r) => r.value)
    .filter((i) => i.title && i.link);

  if (items.length === 0) {
    throw new Error(
      "Não foi possível ler nenhum feed dessa categoria. Tente novamente em instantes."
    );
  }

  // Prioriza notícias das últimas horas; se não houver, usa as mais recentes disponíveis
  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  const recent = items.filter((i) => i.pubDate && i.pubDate.getTime() >= cutoff);
  const pool = (recent.length > 0 ? recent : items).sort(
    (a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0)
  );

  // Remove notícias que já viraram post
  const links = pool.map((i) => i.link);
  const existing = await prisma.post.findMany({
    where: { sourceUrl: { in: links } },
    select: { sourceUrl: true },
  });
  const used = new Set(existing.map((p) => p.sourceUrl));
  const fresh = pool.filter((i) => !used.has(i.link));

  if (fresh.length === 0) {
    throw new Error(
      "Todas as notícias recentes dessa categoria já foram publicadas. Tente mais tarde."
    );
  }

  return fresh.slice(0, MAX_ITEMS);
}

// Modelos em ordem de preferência: se o principal estiver sobrecarregado
// (503/429), tenta de novo e depois cai para o alternativo (ambos gratuitos)
const AI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
const RETRIES_PER_MODEL = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isTransientAiError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand|try again/i.test(
    msg
  );
}

async function generateWithRetry(
  ai: GoogleGenAI,
  prompt: string,
  config: GenerateContentConfig
) {
  let attempt = 0;
  for (const model of AI_MODELS) {
    for (let i = 0; i < RETRIES_PER_MODEL; i++) {
      try {
        return await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });
      } catch (error) {
        if (!isTransientAiError(error)) throw error;
        attempt++;
        console.log(
          `[robô] IA sobrecarregada (${model}), tentativa ${attempt} de ${
            AI_MODELS.length * RETRIES_PER_MODEL
          }…`
        );
        await sleep(4000 * attempt);
      }
    }
  }
  throw new Error(
    "A IA do Google está temporariamente sobrecarregada (erro 503). Aguarde alguns minutos e tente de novo — no modo automático, o robô tentará no próximo ciclo."
  );
}

async function writePost(categoryLabel: string, items: NewsItem[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Crie uma chave gratuita em https://aistudio.google.com/apikey e adicione ao .env"
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const list = items
    .map(
      (item, i) =>
        `${i}. [${item.sourceName}] ${item.title}\n   Resumo: ${item.snippet}\n   Publicado em: ${item.pubDate?.toISOString() ?? "desconhecido"}`
    )
    .join("\n\n");

  const prompt = `Você é o editor-chefe de um blog brasileiro moderno e minimalista sobre ${categoryLabel}.

Abaixo está uma lista numerada das notícias mais recentes coletadas de veículos confiáveis. Sua tarefa:

1. Escolha a MELHOR notícia: a mais relevante, mais atual e com maior interesse para o público geral. Informe o número dela em "chosenIndex".
2. Escreva um post de blog completo e bem elaborado sobre essa notícia, em português do Brasil.

Regras do post:
- Título próprio, chamativo mas sem clickbait (máx. 90 caracteres).
- "excerpt": um parágrafo curto de abertura (máx. 220 caracteres) que resuma a essência.
- "content": o corpo do post em Markdown, com 400 a 700 palavras, usando subtítulos (##), parágrafos curtos e, quando fizer sentido, listas. Estruture com contexto, o fato principal, desdobramentos e o que esperar a seguir. NÃO repita o título no corpo. NÃO invente fatos além do que está no resumo — desenvolva com contexto geral do tema.
- "tags": 3 a 5 tags curtas em minúsculas.

Notícias disponíveis:

${list}`;

  const config = {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        chosenIndex: { type: Type.INTEGER },
        title: { type: Type.STRING },
        excerpt: { type: Type.STRING },
        content: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["chosenIndex", "title", "excerpt", "content", "tags"],
    },
  };

  const response = await generateWithRetry(ai, prompt, config);

  const text = response.text;
  if (!text) throw new Error("A IA não retornou conteúdo. Tente novamente.");

  const data = JSON.parse(text) as {
    chosenIndex: number;
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
  };

  const source = items[data.chosenIndex] ?? items[0];
  return { ...data, source };
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "post";
  let slug = base;
  let n = 2;
  while (await prisma.post.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function runRobot(categorySlug: string): Promise<Post> {
  const category = getCategory(categorySlug);
  if (!category) throw new Error(`Categoria inválida: ${categorySlug}`);

  const items = await fetchNews(categorySlug);
  const draft = await writePost(category.label, items);
  const slug = await uniqueSlug(draft.title);

  return prisma.post.create({
    data: {
      title: draft.title,
      slug,
      excerpt: draft.excerpt,
      content: draft.content,
      category: category.slug,
      tags: draft.tags.join(","),
      sourceUrl: draft.source.link,
      sourceName: draft.source.sourceName,
      aiGenerated: true,
      published: true,
    },
  });
}
