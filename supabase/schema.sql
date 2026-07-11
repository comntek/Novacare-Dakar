-- =========================================================
-- NovaCare Dakar — Migration Auth Firebase -> Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =========================================================

create extension if not exists "uuid-ossp";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'medecin', 'secretaire', 'patient');
  end if;
end$$;

-- Table utilisateurs : équivalent de la collection Firestore "utilisateurs"
-- id = même UUID que auth.users(id)
create table if not exists public.utilisateurs (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text not null default '',
  nom text not null default '',
  email text not null,
  role public.user_role not null default 'patient',
  actif boolean not null default true,
  specialite text,
  tarif numeric,
  telephone text,
  disponibilites jsonb default '{}'::jsonb,
  date_creation timestamptz not null default now()
);

alter table public.utilisateurs enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
as $$
  select role from public.utilisateurs where id = auth.uid();
$$;

drop policy if exists "select_own_profile" on public.utilisateurs;
create policy "select_own_profile"
  on public.utilisateurs for select
  using (id = auth.uid());

drop policy if exists "select_all_admin_secretaire" on public.utilisateurs;
create policy "select_all_admin_secretaire"
  on public.utilisateurs for select
  using (public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "update_own_profile" on public.utilisateurs;
create policy "update_own_profile"
  on public.utilisateurs for update
  using (id = auth.uid());

drop policy if exists "update_admin_all" on public.utilisateurs;
create policy "update_admin_all"
  on public.utilisateurs for update
  using (public.current_user_role() = 'admin');

drop policy if exists "insert_self_or_admin" on public.utilisateurs;
create policy "insert_self_or_admin"
  on public.utilisateurs for insert
  with check (id = auth.uid() or public.current_user_role() = 'admin');

-- Trigger : création automatique du profil à l'inscription (rôle "patient" par défaut,
-- ou le rôle passé dans raw_user_meta_data pour les comptes créés via le script de seed / l'admin API)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.utilisateurs (id, prenom, nom, email, role, actif)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'patient'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Table patients minimale (nécessaire pour l'inscription publique).
-- À enrichir/aligner avec le reste des champs Firestore lors de la
-- migration complète de la collection "patients".
create table if not exists public.patients (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text,
  nom text,
  date_naissance date,
  sexe text,
  groupe_sanguin text,
  telephone text,
  email text,
  adresse text,
  numero_dossier text unique,
  allergies text[] default '{}',
  antecedents text[] default '{}',
  assurance text,
  medecin_referent_id uuid references public.utilisateurs(id),
  medecin_referent_nom text,
  source text default 'app',
  date_creation timestamptz not null default now()
);

alter table public.patients enable row level security;

drop policy if exists "patient_select_own" on public.patients;
create policy "patient_select_own"
  on public.patients for select
  using (id = auth.uid());

drop policy if exists "patient_select_staff" on public.patients;
create policy "patient_select_staff"
  on public.patients for select
  using (public.current_user_role() in ('admin', 'secretaire', 'medecin'));

drop policy if exists "patient_insert_self_or_staff" on public.patients;
create policy "patient_insert_self_or_staff"
  on public.patients for insert
  with check (id = auth.uid() or public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "patient_update_self_or_staff" on public.patients;
create policy "patient_update_self_or_staff"
  on public.patients for update
  using (id = auth.uid() or public.current_user_role() in ('admin', 'secretaire'));
