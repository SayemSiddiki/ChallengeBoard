-- Profiles table for user names (run in Supabase SQL editor)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Profiles: select own" on public.profiles;
create policy "Profiles: select own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

