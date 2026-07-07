-- Schema da tabela `posts` — rode uma vez no SQL Editor do Supabase
-- (Dashboard > SQL Editor > New query > cole tudo > Run).

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  title        text        not null,
  slug         text        not null unique,
  excerpt      text        not null,
  content      text        not null,
  category     text        not null,
  tags         text        not null default '',
  source_url   text,
  source_name  text,
  ai_generated boolean     not null default false,
  published    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_category_idx   on public.posts (category);
create index if not exists posts_source_url_idx on public.posts (source_url);

-- O app acessa via chave service_role (só no servidor), que ignora RLS.
-- Habilitamos RLS sem policies para bloquear a chave anon pública por padrão.
alter table public.posts enable row level security;
