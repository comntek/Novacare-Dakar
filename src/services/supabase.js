import { createClient } from '@supabase/supabase-js'

// Remplace src/services/firebase.js pour l'authentification.
// firebase.js reste en place tant que les autres collections
// (rendezvous, consultations, factures...) n'ont pas été migrées.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables Supabase manquantes : vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export default supabase
