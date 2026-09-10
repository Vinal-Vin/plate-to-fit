-- PlateToFit initial schema: weeks, meals, RLS, storage bucket.

create extension if not exists pgcrypto;

create table if not exists weeks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  start_date    date not null,          -- Monday of the week
  goal_preset   text,                   -- e.g. 'flatten_stomach'
  goal_note     text,
  created_at    timestamptz default now(),
  unique (user_id, start_date)
);

create table if not exists meals (
  id            uuid primary key default gen_random_uuid(),
  week_id       uuid not null references weeks(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  day_of_week   int not null check (day_of_week between 0 and 6),  -- 0 = Monday
  label         text,
  note          text,
  image_path    text not null,          -- Supabase Storage object path
  created_at    timestamptz default now()
);

create index if not exists meals_week_id_idx on meals (week_id);
create index if not exists meals_week_day_idx on meals (week_id, day_of_week);

alter table weeks enable row level security;
alter table meals enable row level security;

drop policy if exists "weeks_select_own" on weeks;
create policy "weeks_select_own" on weeks
  for select using (auth.uid() = user_id);

drop policy if exists "weeks_insert_own" on weeks;
create policy "weeks_insert_own" on weeks
  for insert with check (auth.uid() = user_id);

drop policy if exists "weeks_update_own" on weeks;
create policy "weeks_update_own" on weeks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "weeks_delete_own" on weeks;
create policy "weeks_delete_own" on weeks
  for delete using (auth.uid() = user_id);

drop policy if exists "meals_select_own" on meals;
create policy "meals_select_own" on meals
  for select using (auth.uid() = user_id);

drop policy if exists "meals_insert_own" on meals;
create policy "meals_insert_own" on meals
  for insert with check (auth.uid() = user_id);

drop policy if exists "meals_update_own" on meals;
create policy "meals_update_own" on meals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "meals_delete_own" on meals;
create policy "meals_delete_own" on meals
  for delete using (auth.uid() = user_id);

-- Storage: one bucket, objects keyed {user_id}/{week_id}/{meal_id}.jpg
insert into storage.buckets (id, name, public)
values ('meal-images', 'meal-images', false)
on conflict (id) do nothing;

drop policy if exists "meal_images_select_own" on storage.objects;
create policy "meal_images_select_own" on storage.objects
  for select using (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "meal_images_insert_own" on storage.objects;
create policy "meal_images_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "meal_images_update_own" on storage.objects;
create policy "meal_images_update_own" on storage.objects
  for update using (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "meal_images_delete_own" on storage.objects;
create policy "meal_images_delete_own" on storage.objects
  for delete using (
    bucket_id = 'meal-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
