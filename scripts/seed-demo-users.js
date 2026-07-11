// Exécuter UNE FOIS avec Node — utilise la clé "service_role" (tous les droits),
// donc JAMAIS côté client/navigateur.
//
// Utilisation :
//   npm install @supabase/supabase-js
//   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-demo-users.js

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (Project Settings > API sur supabase.com) avant de lancer ce script.'
  )
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Gardez les mêmes emails que vos anciens comptes Firebase si vous préférez :
// admin@medisync.sn / medecin@medisync.sn / secretaire@medisync.sn / patient@medisync.sn
const comptes = [
  { email: 'admin@novacare.sn', password: 'Admin2025!', prenom: 'Admin', nom: 'NovaCare', role: 'admin' },
  {
    email: 'medecin@novacare.sn',
    password: 'Medecin2025!',
    prenom: 'Fatou',
    nom: 'Diop',
    role: 'medecin',
    specialite: 'Médecine générale',
    tarif: 15000,
  },
  { email: 'secretaire@novacare.sn', password: 'Secretaire2025!', prenom: 'Aida', nom: 'Ndiaye', role: 'secretaire' },
  { email: 'patient@novacare.sn', password: 'Patient2025!', prenom: 'Moussa', nom: 'Sall', role: 'patient' },
]

async function seed() {
  for (const compte of comptes) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: compte.email,
      password: compte.password,
      email_confirm: true, // pas de mail de confirmation à gérer pour les comptes démo
      user_metadata: { prenom: compte.prenom, nom: compte.nom, role: compte.role },
    })

    if (error) {
      console.error(`Erreur création ${compte.email} :`, error.message)
      continue
    }

    // Le trigger handle_new_user insère déjà la ligne avec le bon rôle (lu dans
    // user_metadata.role), mais on complète ici les champs métier (spécialité, tarif...)
    const { error: updateError } = await supabaseAdmin
      .from('utilisateurs')
      .update({ specialite: compte.specialite ?? null, tarif: compte.tarif ?? null })
      .eq('id', data.user.id)

    if (updateError) {
      console.error(`Erreur mise à jour ${compte.email} :`, updateError.message)
    } else {
      console.log(`✅ Compte créé : ${compte.email} (${compte.role})`)
    }
  }
}

seed()
