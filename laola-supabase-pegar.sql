-- La Ola Cevichera: copia TODO este archivo en Supabase → SQL Editor → Run
-- Si la ultima linea da error "already member of publication", ignoralo.

create table if not exists public.laola_app_state (
  id text primary key default 'default',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.laola_app_state enable row level security;

drop policy if exists "laola_anon_read" on public.laola_app_state;
drop policy if exists "laola_anon_write" on public.laola_app_state;
drop policy if exists "laola_anon_update" on public.laola_app_state;

create policy "laola_anon_read"
  on public.laola_app_state for select
  using (true);

create policy "laola_anon_write"
  on public.laola_app_state for insert
  with check (true);

create policy "laola_anon_update"
  on public.laola_app_state for update
  using (true)
  with check (true);

alter publication supabase_realtime add table public.laola_app_state;
