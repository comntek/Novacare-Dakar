-- =========================================================
-- NovaCare Dakar — Table clinique (config globale, singleton)
-- À exécuter dans Supabase Dashboard > SQL Editor
-- Idempotent : peut être relancé sans risque
-- =========================================================

create table if not exists public.clinique (
  id smallint primary key default 1,
  nom_clinique text not null default 'NovaCare Dakar',
  slogan text default '',
  adresse text default '',
  telephone text default '',
  telephone_2 text default '',
  email text default '',
  site_web text default '',
  ninea text default '',

  -- Horaires : { lundi: {actif, debut, fin}, mardi: {...}, ... }
  horaires jsonb not null default '{
    "lundi":    {"actif": true,  "debut": "08:00", "fin": "20:00"},
    "mardi":    {"actif": true,  "debut": "08:00", "fin": "20:00"},
    "mercredi": {"actif": true,  "debut": "08:00", "fin": "20:00"},
    "jeudi":    {"actif": true,  "debut": "08:00", "fin": "20:00"},
    "vendredi": {"actif": true,  "debut": "08:00", "fin": "20:00"},
    "samedi":   {"actif": true,  "debut": "09:00", "fin": "18:00"},
    "dimanche": {"actif": false, "debut": "09:00", "fin": "13:00"}
  }'::jsonb,

  -- Apparence
  couleur_primaire text default '#0A5C3E',
  couleur_secondaire text default '#C9922A',
  logo_url text default '',

  -- Réseaux sociaux
  facebook text default '',
  instagram text default '',
  whatsapp text default '',
  linkedin text default '',

  date_mise_a_jour timestamptz not null default now(),

  constraint clinique_singleton check (id = 1)
);

alter table public.clinique enable row level security;

-- Lecture publique : le site vitrine (visiteurs non connectés) doit
-- pouvoir afficher nom, adresse, téléphone, horaires, etc.
drop policy if exists "clinique_select_public" on public.clinique;
create policy "clinique_select_public" on public.clinique for select
  using (true);

-- Écriture réservée à l'admin
drop policy if exists "clinique_update_admin" on public.clinique;
create policy "clinique_update_admin" on public.clinique for update
  using (public.current_user_role() = 'admin');

drop policy if exists "clinique_insert_admin" on public.clinique;
create policy "clinique_insert_admin" on public.clinique for insert
  with check (public.current_user_role() = 'admin');

-- Ligne unique par défaut si elle n'existe pas encore
insert into public.clinique (id)
values (1)
on conflict (id) do nothing;
