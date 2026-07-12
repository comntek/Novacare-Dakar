-- =========================================================
-- NovaCare Dakar — Schéma complet Supabase (remplace Firestore)
-- À exécuter dans Supabase Dashboard > SQL Editor
-- Idempotent : peut être relancé sans risque
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto"; -- pour gen_random_uuid()

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'medecin', 'secretaire', 'patient');
  end if;
  if not exists (select 1 from pg_type where typname = 'rdv_statut') then
    create type public.rdv_statut as enum ('en_attente', 'confirme', 'arrive', 'en_consultation', 'termine', 'annule');
  end if;
  if not exists (select 1 from pg_type where typname = 'rdv_type') then
    create type public.rdv_type as enum ('presentiel', 'teleconsultation');
  end if;
  if not exists (select 1 from pg_type where typname = 'consultation_statut') then
    create type public.consultation_statut as enum ('en_cours', 'termine');
  end if;
  if not exists (select 1 from pg_type where typname = 'facture_statut') then
    create type public.facture_statut as enum ('impayee', 'payee');
  end if;
end$$;

-- ══════════════════════════════════════════════════════════
-- UTILISATEURS  (comptes avec login : admin, médecin, secrétaire, patient)
-- id = auth.users(id) — 1 compte Auth = 1 ligne ici
-- ══════════════════════════════════════════════════════════
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
language sql security definer stable
as $$
  select role from public.utilisateurs where id = auth.uid();
$$;

drop policy if exists "select_own_profile" on public.utilisateurs;
create policy "select_own_profile" on public.utilisateurs for select using (id = auth.uid());

drop policy if exists "select_all_staff" on public.utilisateurs;
create policy "select_all_staff" on public.utilisateurs for select
  using (public.current_user_role() in ('admin', 'secretaire'));

-- Un médecin doit pouvoir voir les profils des patients qui le contactent en
-- messagerie, et des autres médecins/secrétaires/admins (annuaire interne)
drop policy if exists "select_all_medecin" on public.utilisateurs;
create policy "select_all_medecin" on public.utilisateurs for select
  using (public.current_user_role() = 'medecin');

drop policy if exists "update_own_profile" on public.utilisateurs;
create policy "update_own_profile" on public.utilisateurs for update using (id = auth.uid());

drop policy if exists "update_admin_all" on public.utilisateurs;
create policy "update_admin_all" on public.utilisateurs for update
  using (public.current_user_role() = 'admin');

drop policy if exists "insert_self_or_admin" on public.utilisateurs;
create policy "insert_self_or_admin" on public.utilisateurs for insert
  with check (id = auth.uid() or public.current_user_role() = 'admin');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
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

-- ══════════════════════════════════════════════════════════
-- PATIENTS  (dossiers médicaux)
-- id INDÉPENDANT de auth.users : un dossier peut exister sans compte
-- (créé par la secrétaire). Quand un patient s'inscrit lui-même via
-- /inscription, on fixe volontairement id = son uid Auth (voir useAuth.js)
-- pour que tout le reste du code (qui utilise user.uid comme patientId)
-- continue de fonctionner sans changement.
-- ══════════════════════════════════════════════════════════
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  prenom text not null default '',
  nom text not null default '',
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
  medecin_referent_id uuid references public.utilisateurs(id) on delete set null,
  medecin_referent_nom text,
  source text default 'app',
  date_creation timestamptz not null default now(),
  date_mise_a_jour timestamptz
);

alter table public.patients enable row level security;

drop policy if exists "patient_select_own" on public.patients;
create policy "patient_select_own" on public.patients for select using (id = auth.uid());

drop policy if exists "patient_select_staff" on public.patients;
create policy "patient_select_staff" on public.patients for select
  using (public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "patient_select_medecin_referent" on public.patients;
create policy "patient_select_medecin_referent" on public.patients for select
  using (public.current_user_role() = 'medecin' and medecin_referent_id = auth.uid());

drop policy if exists "patient_insert_self_or_staff" on public.patients;
create policy "patient_insert_self_or_staff" on public.patients for insert
  with check (id = auth.uid() or public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "patient_update_self_or_staff" on public.patients;
create policy "patient_update_self_or_staff" on public.patients for update
  using (id = auth.uid() or public.current_user_role() in ('admin', 'secretaire'));

create index if not exists idx_patients_medecin_referent on public.patients(medecin_referent_id);

-- ══════════════════════════════════════════════════════════
-- RENDEZ-VOUS
-- ══════════════════════════════════════════════════════════
create table if not exists public.rendezvous (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  patient_nom text,
  patient_prenom text,
  patient_nom_famille text,
  patient_email text,
  patient_telephone text,
  medecin_id uuid references public.utilisateurs(id) on delete set null,
  medecin_nom text,
  date date not null,
  heure text not null,
  motif text,
  notes text,
  type public.rdv_type not null default 'presentiel',
  statut public.rdv_statut not null default 'en_attente',
  patient_non_inscrit boolean not null default false,
  source text,
  date_creation timestamptz not null default now(),
  date_mise_a_jour timestamptz
);

alter table public.rendezvous enable row level security;

drop policy if exists "rdv_select_staff" on public.rendezvous;
create policy "rdv_select_staff" on public.rendezvous for select
  using (public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "rdv_select_medecin" on public.rendezvous;
create policy "rdv_select_medecin" on public.rendezvous for select
  using (public.current_user_role() = 'medecin' and medecin_id = auth.uid());

drop policy if exists "rdv_select_patient" on public.rendezvous;
create policy "rdv_select_patient" on public.rendezvous for select
  using (patient_id = auth.uid());

-- Insertion : la secrétaire/l'admin/le médecin depuis l'app, OU un visiteur
-- anonyme depuis /prise-rdv (patient_non_inscrit = true, aucune session requise)
drop policy if exists "rdv_insert" on public.rendezvous;
create policy "rdv_insert" on public.rendezvous for insert
  with check (
    patient_non_inscrit = true
    or public.current_user_role() in ('admin', 'secretaire', 'medecin')
  );

drop policy if exists "rdv_update_staff" on public.rendezvous;
create policy "rdv_update_staff" on public.rendezvous for update
  using (public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "rdv_update_medecin" on public.rendezvous;
create policy "rdv_update_medecin" on public.rendezvous for update
  using (public.current_user_role() = 'medecin' and medecin_id = auth.uid());

create index if not exists idx_rdv_medecin on public.rendezvous(medecin_id);
create index if not exists idx_rdv_patient on public.rendezvous(patient_id);
create index if not exists idx_rdv_date on public.rendezvous(date);
create index if not exists idx_rdv_non_inscrit on public.rendezvous(patient_non_inscrit);

-- ══════════════════════════════════════════════════════════
-- CONSULTATIONS
-- ══════════════════════════════════════════════════════════
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  patient_nom text,
  medecin_id uuid references public.utilisateurs(id) on delete set null,
  medecin_nom text,
  date date not null default current_date,
  motif text,
  examen_clinique text,
  diagnostic text,
  plan_traitement text,
  ordonnances jsonb not null default '[]'::jsonb, -- [{medicament, posologie, duree}]
  statut public.consultation_statut not null default 'en_cours',
  date_creation timestamptz not null default now(),
  date_mise_a_jour timestamptz
);

alter table public.consultations enable row level security;

drop policy if exists "consultation_select_staff" on public.consultations;
create policy "consultation_select_staff" on public.consultations for select
  using (public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "consultation_select_medecin" on public.consultations;
create policy "consultation_select_medecin" on public.consultations for select
  using (public.current_user_role() = 'medecin' and medecin_id = auth.uid());

drop policy if exists "consultation_select_patient" on public.consultations;
create policy "consultation_select_patient" on public.consultations for select
  using (patient_id = auth.uid());

drop policy if exists "consultation_insert_medecin" on public.consultations;
create policy "consultation_insert_medecin" on public.consultations for insert
  with check (public.current_user_role() = 'medecin' and medecin_id = auth.uid());

drop policy if exists "consultation_update_medecin" on public.consultations;
create policy "consultation_update_medecin" on public.consultations for update
  using (public.current_user_role() = 'medecin' and medecin_id = auth.uid());

create index if not exists idx_consult_medecin on public.consultations(medecin_id);
create index if not exists idx_consult_patient on public.consultations(patient_id);

-- ══════════════════════════════════════════════════════════
-- FACTURES
-- ══════════════════════════════════════════════════════════
create table if not exists public.factures (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  patient_nom text,
  service text,
  montant numeric not null default 0,
  statut public.facture_statut not null default 'impayee',
  mode_paiement text,
  date_creation timestamptz not null default now(),
  date_paiement timestamptz
);

alter table public.factures enable row level security;

drop policy if exists "facture_select_staff" on public.factures;
create policy "facture_select_staff" on public.factures for select
  using (public.current_user_role() in ('admin', 'secretaire'));

drop policy if exists "facture_select_patient" on public.factures;
create policy "facture_select_patient" on public.factures for select
  using (patient_id = auth.uid());

drop policy if exists "facture_insert_staff" on public.factures;
create policy "facture_insert_staff" on public.factures for insert
  with check (public.current_user_role() in ('admin', 'secretaire', 'medecin'));

drop policy if exists "facture_update_staff" on public.factures;
create policy "facture_update_staff" on public.factures for update
  using (public.current_user_role() in ('admin', 'secretaire'));

create index if not exists idx_facture_patient on public.factures(patient_id);

-- ══════════════════════════════════════════════════════════
-- CONVERSATIONS & MESSAGES  (messagerie interne)
-- ══════════════════════════════════════════════════════════
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1 uuid not null references public.utilisateurs(id) on delete cascade,
  participant_2 uuid not null references public.utilisateurs(id) on delete cascade,
  dernier_message text,
  dernier_message_date timestamptz,
  non_lus jsonb not null default '{}'::jsonb, -- { "uid": true/false }
  date_creation timestamptz not null default now(),
  constraint conversation_participants_distincts check (participant_1 <> participant_2)
);

alter table public.conversations enable row level security;

drop policy if exists "conversation_select_participant" on public.conversations;
create policy "conversation_select_participant" on public.conversations for select
  using (auth.uid() in (participant_1, participant_2));

-- Restrictions métier fines (médecin <-> patient référent uniquement, etc.)
-- restent appliquées côté application comme avant ; RLS garantit ici la
-- règle de base : on ne peut voir/écrire que ses propres conversations.
drop policy if exists "conversation_insert_participant" on public.conversations;
create policy "conversation_insert_participant" on public.conversations for insert
  with check (auth.uid() in (participant_1, participant_2));

drop policy if exists "conversation_update_participant" on public.conversations;
create policy "conversation_update_participant" on public.conversations for update
  using (auth.uid() in (participant_1, participant_2));

create index if not exists idx_conv_p1 on public.conversations(participant_1);
create index if not exists idx_conv_p2 on public.conversations(participant_2);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  expediteur_id uuid not null references public.utilisateurs(id) on delete cascade,
  expediteur_nom text,
  destinataire_id uuid not null references public.utilisateurs(id) on delete cascade,
  texte text not null,
  date_envoi timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "message_select_participant" on public.messages;
create policy "message_select_participant" on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.participant_1, c.participant_2)
    )
  );

drop policy if exists "message_insert_participant" on public.messages;
create policy "message_insert_participant" on public.messages for insert
  with check (
    expediteur_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.participant_1, c.participant_2)
    )
  );

create index if not exists idx_messages_conversation on public.messages(conversation_id);

-- ══════════════════════════════════════════════════════════
-- ARTICLES (blog public)
-- ══════════════════════════════════════════════════════════
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  categorie text,
  resume text,
  contenu text,
  publie boolean not null default false,
  auteur text,
  auteur_id uuid references public.utilisateurs(id) on delete set null,
  date_publication timestamptz not null default now(),
  date_mise_a_jour timestamptz
);

alter table public.articles enable row level security;

-- Le blog public doit être lisible par tout le monde, y compris les
-- visiteurs non connectés (site vitrine)
drop policy if exists "article_select_publie" on public.articles;
create policy "article_select_publie" on public.articles for select
  using (publie = true);

drop policy if exists "article_select_admin" on public.articles;
create policy "article_select_admin" on public.articles for select
  using (public.current_user_role() = 'admin');

drop policy if exists "article_write_admin" on public.articles;
create policy "article_insert_admin" on public.articles for insert
  with check (public.current_user_role() = 'admin');

drop policy if exists "article_update_admin" on public.articles;
create policy "article_update_admin" on public.articles for update
  using (public.current_user_role() = 'admin');

drop policy if exists "article_delete_admin" on public.articles;
create policy "article_delete_admin" on public.articles for delete
  using (public.current_user_role() = 'admin');

-- ══════════════════════════════════════════════════════════
-- REALTIME — active la réplication pour les tables qui en ont besoin
-- (file d'attente secrétaire, messagerie temps réel)
-- ══════════════════════════════════════════════════════════
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rendezvous'
  ) then
    alter publication supabase_realtime add table public.rendezvous;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;
end$$;
