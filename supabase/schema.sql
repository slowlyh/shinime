-- ============================================================
-- Shinime — Anime Streaming Platform Supabase Schema (v2.0)
-- Skema Database Lengkap:
-- 1. profiles: data profil pengguna (terhubung ke auth.users)
-- 2. anime: katalog anime (metadata, poster, score, studio, genres)
-- 3. episodes: episode anime (nomor episode, stream servers, download links)
-- 4. bookmarks: daftar anime favorit / simpanan pengguna
-- 5. watch_history: riwayat tontonan episode dan progres durasi
-- 6. comments: komentar diskusi pada anime atau episode tertentu
-- Termasuk Row Level Security (RLS), Trigger Auto Profile, dan Indexes
-- Jalankan SELURUH file ini di Supabase SQL Editor (idempotent)
-- ============================================================

-- ---------- EKSTENSI ----------
create extension if not exists pgcrypto;

-- ---------- 1. PROFILES (Terhubung ke auth.users) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 30)
);

alter table public.profiles enable row level security;

drop policy if exists "Profil publik dapat dibaca oleh siapa saja" on public.profiles;
create policy "Profil publik dapat dibaca oleh siapa saja"
  on public.profiles for select using (true);

drop policy if exists "Pengguna hanya bisa insert profil miliknya" on public.profiles;
create policy "Pengguna hanya bisa insert profil miliknya"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Pengguna hanya bisa update profil miliknya" on public.profiles;
create policy "Pengguna hanya bisa update profil miliknya"
  on public.profiles for update using (auth.uid() = id);

-- ---------- 2. ANIME (Katalog & Cache Metadata Anime) ----------
create table if not exists public.anime (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  japanese_title text,
  poster         text,
  score          numeric(3,2),
  status         text default 'Ongoing',
  type           text default 'TV',
  genres         text[] default '{}',
  synopsis       text,
  studio         text,
  season         text,
  total_episodes integer default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists anime_slug_idx   on public.anime(slug);
create index if not exists anime_status_idx on public.anime(status);
create index if not exists anime_score_idx  on public.anime(score desc);

alter table public.anime enable row level security;

drop policy if exists "Katalog anime dapat dibaca oleh siapa saja" on public.anime;
create policy "Katalog anime dapat dibaca oleh siapa saja"
  on public.anime for select using (true);

drop policy if exists "Hanya service_role yang bisa mengubah anime" on public.anime;
create policy "Hanya service_role yang bisa mengubah anime"
  on public.anime for all to service_role using (true) with check (true);

-- ---------- 3. EPISODES (Daftar Episode Anime & Sumber Stream) ----------
create table if not exists public.episodes (
  id             uuid primary key default gen_random_uuid(),
  anime_slug     text not null references public.anime(slug) on delete cascade,
  episode_number integer not null,
  title          text,
  stream_urls    jsonb default '[]'::jsonb,
  download_urls  jsonb default '[]'::jsonb,
  released_at    timestamptz,
  created_at     timestamptz not null default now(),
  unique (anime_slug, episode_number)
);

create index if not exists episodes_anime_slug_idx on public.episodes(anime_slug);
create index if not exists episodes_number_idx     on public.episodes(episode_number);

alter table public.episodes enable row level security;

drop policy if exists "Episode dapat dibaca oleh siapa saja" on public.episodes;
create policy "Episode dapat dibaca oleh siapa saja"
  on public.episodes for select using (true);

drop policy if exists "Hanya service_role yang bisa mengubah episodes" on public.episodes;
create policy "Hanya service_role yang bisa mengubah episodes"
  on public.episodes for all to service_role using (true) with check (true);

-- ---------- 4. BOOKMARKS (Daftar Anime Favorit / Watchlist) ----------
create table if not exists public.bookmarks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  anime_slug   text not null,
  anime_title  text not null,
  anime_poster text,
  created_at   timestamptz not null default now(),
  unique (user_id, anime_slug)
);

create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);

alter table public.bookmarks enable row level security;

drop policy if exists "Pengguna dapat membaca bookmark miliknya" on public.bookmarks;
create policy "Pengguna dapat membaca bookmark miliknya"
  on public.bookmarks for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menambahkan bookmark miliknya" on public.bookmarks;
create policy "Pengguna dapat menambahkan bookmark miliknya"
  on public.bookmarks for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menghapus bookmark miliknya" on public.bookmarks;
create policy "Pengguna dapat menghapus bookmark miliknya"
  on public.bookmarks for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- 5. WATCH_HISTORY (Riwayat Tontonan & Progres Episode) ----------
create table if not exists public.watch_history (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  anime_slug       text not null,
  anime_title      text not null,
  anime_poster     text,
  episode_number   integer not null,
  progress_seconds integer default 0,
  duration_seconds integer default 0,
  completed        boolean default false,
  updated_at       timestamptz not null default now(),
  unique (user_id, anime_slug, episode_number)
);

create index if not exists watch_history_user_id_idx   on public.watch_history(user_id);
create index if not exists watch_history_updated_at_idx on public.watch_history(updated_at desc);

alter table public.watch_history enable row level security;

drop policy if exists "Pengguna dapat membaca riwayat miliknya" on public.watch_history;
create policy "Pengguna dapat membaca riwayat miliknya"
  on public.watch_history for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menambah riwayat miliknya" on public.watch_history;
create policy "Pengguna dapat menambah riwayat miliknya"
  on public.watch_history for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat memperbarui riwayat miliknya" on public.watch_history;
create policy "Pengguna dapat memperbarui riwayat miliknya"
  on public.watch_history for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna dapat menghapus riwayat miliknya" on public.watch_history;
create policy "Pengguna dapat menghapus riwayat miliknya"
  on public.watch_history for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- 6. COMMENTS (Diskusi Komunitas Anime / Episode) ----------
create table if not exists public.comments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  anime_slug     text not null,
  episode_number integer,
  content        text not null,
  created_at     timestamptz not null default now()
);

create index if not exists comments_anime_slug_idx on public.comments(anime_slug);

alter table public.comments enable row level security;

drop policy if exists "Komentar dapat dibaca oleh publik" on public.comments;
create policy "Komentar dapat dibaca oleh publik"
  on public.comments for select using (true);

drop policy if exists "Pengguna terautentikasi dapat membuat komentar" on public.comments;
create policy "Pengguna terautentikasi dapat membuat komentar"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Pengguna hanya dapat menghapus komentar miliknya" on public.comments;
create policy "Pengguna hanya dapat menghapus komentar miliknya"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------- 7. TRIGGER: AUTO-CREATE PROFILE SAAT REGISTER ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'user_name', ''),
      nullif(new.raw_user_meta_data ->> 'username', ''),
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)
    ),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
