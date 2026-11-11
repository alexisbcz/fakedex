-- Fakedex: user-made creature dexes, Archidekt-style.
-- A dex belongs to one user. Everything else (categories, types, abilities,
-- moves, creatures, evolutions) belongs to a dex. Composite foreign keys on
-- (id, dex_id) stop rows from one dex pointing at rows of another dex.

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Fill the profile from the Google account on first sign-in.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Dexes ---------------------------------------------------------------------

create table public.dexes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.dexes (owner_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  position int not null default 0,
  unique (id, dex_id),
  unique (dex_id, name)
);

create table public.types (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 30),
  color text not null default '#9ca3af' check (color ~ '^#[0-9a-fA-F]{6}$'),
  unique (id, dex_id),
  unique (dex_id, name)
);

-- How much damage an attacking type does to a defending type.
-- A missing row means x1.
create table public.type_matchups (
  dex_id uuid not null references public.dexes (id) on delete cascade,
  attacker_type_id uuid not null,
  defender_type_id uuid not null,
  multiplier numeric(2, 1) not null check (multiplier in (0, 0.5, 2)),
  primary key (attacker_type_id, defender_type_id),
  foreign key (attacker_type_id, dex_id) references public.types (id, dex_id) on delete cascade,
  foreign key (defender_type_id, dex_id) references public.types (id, dex_id) on delete cascade
);

create table public.abilities (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  description text,
  unique (id, dex_id),
  unique (dex_id, name)
);

create type public.damage_class as enum ('physical', 'special', 'status');

create table public.moves (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  type_id uuid,
  damage_class public.damage_class not null default 'physical',
  power int check (power between 1 and 250),
  accuracy int check (accuracy between 1 and 100),
  pp int not null default 10 check (pp between 1 and 64),
  description text,
  unique (id, dex_id),
  unique (dex_id, name),
  foreign key (type_id, dex_id) references public.types (id, dex_id) on delete set null (type_id)
);

create table public.creatures (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  number int not null check (number between 0 and 9999),
  name text not null check (char_length(name) between 1 and 40),
  species text,
  description text,
  image_path text,
  category_id uuid,
  primary_type_id uuid,
  secondary_type_id uuid,
  height_m numeric(5, 2) check (height_m > 0),
  weight_kg numeric(6, 1) check (weight_kg > 0),
  hp int not null default 50 check (hp between 1 and 255),
  attack int not null default 50 check (attack between 1 and 255),
  defense int not null default 50 check (defense between 1 and 255),
  sp_attack int not null default 50 check (sp_attack between 1 and 255),
  sp_defense int not null default 50 check (sp_defense between 1 and 255),
  speed int not null default 50 check (speed between 1 and 255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, dex_id),
  unique (dex_id, number),
  check (secondary_type_id is null or secondary_type_id <> primary_type_id),
  foreign key (category_id, dex_id) references public.categories (id, dex_id) on delete set null (category_id),
  foreign key (primary_type_id, dex_id) references public.types (id, dex_id) on delete set null (primary_type_id),
  foreign key (secondary_type_id, dex_id) references public.types (id, dex_id) on delete set null (secondary_type_id)
);

create table public.creature_abilities (
  dex_id uuid not null references public.dexes (id) on delete cascade,
  creature_id uuid not null,
  ability_id uuid not null,
  is_hidden boolean not null default false,
  primary key (creature_id, ability_id),
  foreign key (creature_id, dex_id) references public.creatures (id, dex_id) on delete cascade,
  foreign key (ability_id, dex_id) references public.abilities (id, dex_id) on delete cascade
);

create type public.learn_method as enum ('level', 'machine', 'egg', 'tutor');

create table public.creature_moves (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  creature_id uuid not null,
  move_id uuid not null,
  method public.learn_method not null default 'level',
  level int check (level between 1 and 100),
  check ((method = 'level') = (level is not null)),
  unique nulls not distinct (creature_id, move_id, method, level),
  foreign key (creature_id, dex_id) references public.creatures (id, dex_id) on delete cascade,
  foreign key (move_id, dex_id) references public.moves (id, dex_id) on delete cascade
);

-- Evolution chains are a graph: each row is one edge "from evolves into to".
-- A chain is every creature reachable from a creature with no parent.
create type public.evolution_trigger as enum ('level', 'item', 'trade', 'friendship', 'other');

create table public.evolutions (
  id uuid primary key default gen_random_uuid(),
  dex_id uuid not null references public.dexes (id) on delete cascade,
  from_creature_id uuid not null,
  to_creature_id uuid not null,
  trigger public.evolution_trigger not null default 'level',
  min_level int check (min_level between 1 and 100),
  condition text,
  unique (from_creature_id, to_creature_id),
  check (from_creature_id <> to_creature_id),
  foreign key (from_creature_id, dex_id) references public.creatures (id, dex_id) on delete cascade,
  foreign key (to_creature_id, dex_id) references public.creatures (id, dex_id) on delete cascade
);
-- A creature evolves from at most one creature (branches go forward only).
create unique index evolutions_one_parent on public.evolutions (to_creature_id);

-- updated_at ----------------------------------------------------------------

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dexes_touch before update on public.dexes
  for each row execute function public.touch_updated_at();
create trigger creatures_touch before update on public.creatures
  for each row execute function public.touch_updated_at();

-- Access helpers ------------------------------------------------------------

create function public.can_read_dex(p_dex_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.dexes d
    where d.id = p_dex_id and (d.is_public or d.owner_id = (select auth.uid()))
  );
$$;

create function public.owns_dex(p_dex_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.dexes d
    where d.id = p_dex_id and d.owner_id = (select auth.uid())
  );
$$;

-- Row level security --------------------------------------------------------

alter table public.profiles enable row level security;
create policy "profiles are public" on public.profiles for select using (true);
create policy "users edit their profile" on public.profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

alter table public.dexes enable row level security;
create policy "read public or own dexes" on public.dexes for select
  using (is_public or owner_id = (select auth.uid()));
create policy "create own dexes" on public.dexes for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "update own dexes" on public.dexes for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "delete own dexes" on public.dexes for delete to authenticated
  using (owner_id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'types', 'type_matchups', 'abilities', 'moves',
    'creatures', 'creature_abilities', 'creature_moves', 'evolutions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create index on public.%I (dex_id)', t);
    execute format('create policy "read with dex" on public.%I for select using (public.can_read_dex(dex_id))', t);
    execute format('create policy "owner inserts" on public.%I for insert to authenticated with check (public.owns_dex(dex_id))', t);
    execute format('create policy "owner updates" on public.%I for update to authenticated using (public.owns_dex(dex_id)) with check (public.owns_dex(dex_id))', t);
    execute format('create policy "owner deletes" on public.%I for delete to authenticated using (public.owns_dex(dex_id))', t);
  end loop;
end;
$$;

-- Creature images -----------------------------------------------------------
-- Files live at <user id>/<dex id>/<file>. Anyone can view; only the
-- uploader's folder is writable.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('creature-images', 'creature-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

create policy "upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'creature-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "update own files" on storage.objects for update to authenticated
  using (bucket_id = 'creature-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "delete own files" on storage.objects for delete to authenticated
  using (bucket_id = 'creature-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
