-- À exécuter une fois dans Supabase : SQL Editor > New query > coller > Run.
-- Une ligne par compte, contenant toute son équipe (effectif + agenda).

create table if not exists public.team_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.team_data enable row level security;

-- Chaque compte ne voit et ne modifie que sa propre équipe.
create policy "Lire sa propre équipe" on public.team_data
  for select using (auth.uid() = user_id);

create policy "Créer sa propre équipe" on public.team_data
  for insert with check (auth.uid() = user_id);

create policy "Modifier sa propre équipe" on public.team_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
