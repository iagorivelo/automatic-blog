-- Adiciona suporte a imagens nos posts (capa + galeria).
-- Rode UMA vez no SQL Editor do Supabase (Dashboard > SQL Editor > Run).
-- Seguro rodar com a tabela já populada: as colunas são opcionais / têm default.

alter table public.posts
  add column if not exists cover_image text;

alter table public.posts
  add column if not exists images jsonb not null default '[]'::jsonb;
