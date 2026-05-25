create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'exercise_category') then
    create type public.exercise_category as enum ('push', 'pull', 'legs', 'arms');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  age integer check (age is null or age between 1 and 130),
  body_weight numeric(6, 2) check (body_weight is null or body_weight >= 0),
  gender text check (gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists age integer check (age is null or age between 1 and 130);
alter table public.profiles add column if not exists body_weight numeric(6, 2) check (body_weight is null or body_weight >= 0);
alter table public.profiles add column if not exists gender text check (gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say'));

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category public.exercise_category not null,
  target_muscle text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.exercise_category not null,
  performed_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  notes text,
  status text not null default 'completed' check (status in ('draft', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  set_index integer not null,
  reps integer not null default 0 check (reps >= 0),
  weight numeric(8, 2) not null default 0 check (weight >= 0),
  notes text,
  completed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_id, exercise_id, set_index)
);

create index if not exists exercises_user_category_idx on public.exercises(user_id, category);
create index if not exists workouts_user_date_idx on public.workouts(user_id, performed_at desc);
create index if not exists workout_sets_user_exercise_idx on public.workout_sets(user_id, exercise_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists exercises_touch_updated_at on public.exercises;
create trigger exercises_touch_updated_at
before update on public.exercises
for each row execute function public.touch_updated_at();

drop trigger if exists workouts_touch_updated_at on public.workouts;
create trigger workouts_touch_updated_at
before update on public.workouts
for each row execute function public.touch_updated_at();

drop trigger if exists workout_sets_touch_updated_at on public.workout_sets;
create trigger workout_sets_touch_updated_at
before update on public.workout_sets
for each row execute function public.touch_updated_at();

create or replace view public.exercise_personal_records
with (security_invoker = true) as
select
  ws.user_id,
  ws.exercise_id,
  e.name as exercise_name,
  e.category,
  max(ws.weight) as max_weight,
  max(ws.reps) as max_reps,
  max(ws.weight * ws.reps) as max_volume_set,
  max(ws.created_at) as latest_set_at
from public.workout_sets ws
join public.exercises e on e.id = ws.exercise_id
where ws.completed = true
group by ws.user_id, ws.exercise_id, e.name, e.category;

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
for update using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "Users manage own exercises" on public.exercises;
create policy "Users manage own exercises" on public.exercises
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own workouts" on public.workouts;
create policy "Users manage own workouts" on public.workouts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own workout sets" on public.workout_sets;
create policy "Users manage own workout sets" on public.workout_sets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.exercises (user_id, name, category, target_muscle)
  values
    (new.id, 'Bench Press', 'push', 'Chest'),
    (new.id, 'Overhead Press', 'push', 'Shoulders'),
    (new.id, 'Incline Dumbbell Press', 'push', 'Upper chest'),
    (new.id, 'Lat Pulldown', 'pull', 'Lats'),
    (new.id, 'Barbell Row', 'pull', 'Back'),
    (new.id, 'Face Pull', 'pull', 'Rear delts'),
    (new.id, 'Back Squat', 'legs', 'Quads'),
    (new.id, 'Romanian Deadlift', 'legs', 'Hamstrings'),
    (new.id, 'Leg Press', 'legs', 'Quads'),
    (new.id, 'Barbell Curl', 'arms', 'Biceps'),
    (new.id, 'Triceps Pushdown', 'arms', 'Triceps'),
    (new.id, 'Hammer Curl', 'arms', 'Brachialis')
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
