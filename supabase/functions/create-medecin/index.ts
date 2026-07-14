// @ts-nocheck
// supabase/functions/create-medecin/index.ts
//
// Edge Function : crée un compte MÉDECIN — Auth + table utilisateurs,
// avec role='medecin' dès la création, et affecte specialite_id/cabinet_id/tarif.
// Réservée à l'admin.
//
// Déploiement :
//   supabase functions deploy create-medecin

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
      return json({ error: 'Seul un administrateur peut créer un compte médecin.' }, 403)
    }

    const body = await req.json()
    const { prenom, nom, email, password, specialiteId, cabinetId, telephone, tarif } = body

    if (!prenom || !nom || !email || !password || !specialiteId) {
      return json({ error: 'Champs obligatoires manquants (prénom, nom, email, mot de passe, spécialité).' }, 400)
    }

    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom, nom, role: 'medecin' },
    })

    if (createError) {
      const message = createError.message?.includes('already been registered')
        ? 'Cet email est déjà utilisé.'
        : createError.message
      return json({ error: message }, 400)
    }

    const misAJour = {
      specialite_id: specialiteId,
      cabinet_id: cabinetId || null,
    }
    if (telephone) misAJour.telephone = telephone
    if (tarif !== undefined) misAJour.tarif = tarif

    const { error: updateError } = await adminClient
      .from('utilisateurs')
      .update(misAJour)
      .eq('id', created.user.id)

    if (updateError) {
      return json({ error: updateError.message }, 500)
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