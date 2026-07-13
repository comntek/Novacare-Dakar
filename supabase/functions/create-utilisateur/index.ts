// @ts-nocheck
// supabase/functions/create-utilisateur/index.ts
//
// Edge Function : crée un compte STAFF (admin ou secrétaire) — Auth + table
// utilisateurs, avec le bon rôle dans user_metadata dès la création.
//
// Pourquoi cette fonction existe : avant, le seul moyen de créer un compte
// avec login était /inscription (toujours role='patient', côté client) ou
// create-medecin (role='medecin', admin uniquement). Il n'y avait AUCUN
// moyen de créer un compte secrétaire ou admin depuis l'app. Tout compte
// créé "à la main" depuis le Dashboard Supabase (Authentication > Add user)
// se retrouvait donc avec role='patient' par défaut (valeur par défaut du
// trigger handle_new_user quand user_metadata.role est absent) — d'où des
// comptes secrétaire/admin qui apparaissaient comme "Patient" partout
// dans l'app.
//
// Déploiement :
//   supabase functions deploy create-utilisateur

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROLES_AUTORISES = ['admin', 'secretaire']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Non authentifié.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser()

    if (callerError || !caller) {
      return json({ error: 'Session invalide.' }, 401)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerProfil, error: profilError } = await adminClient
      .from('utilisateurs')
      .select('role')
      .eq('id', caller.id)
      .maybeSingle()

    if (profilError || callerProfil?.role !== 'admin') {
      return json({ error: 'Seul un administrateur peut créer un compte.' }, 403)
    }

    const body = await req.json()
    const { prenom, nom, email, password, role, telephone } = body

    if (!prenom || !nom || !email || !password || !role) {
      return json({ error: 'Champs obligatoires manquants.' }, 400)
    }

    if (!ROLES_AUTORISES.includes(role)) {
      return json({
        error: "Rôle invalide. Utilisez cette fonction uniquement pour 'admin' ou 'secretaire' — pour un médecin, utilisez Admin > Médecins > Nouveau médecin.",
      }, 400)
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom, nom, role },
    })

    if (createError) {
      const message = createError.message?.includes('already been registered')
        ? 'Cet email est déjà utilisé.'
        : createError.message
      return json({ error: message }, 400)
    }

    if (telephone) {
      const { error: updateError } = await adminClient
        .from('utilisateurs')
        .update({ telephone })
        .eq('id', created.user.id)

      if (updateError) {
        return json({ error: updateError.message }, 500)
      }
    }

    return json({ id: created.user.id }, 200)
  } catch (e) {
    return json({ error: e.message || 'Erreur serveur.' }, 500)
  }
})

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}
