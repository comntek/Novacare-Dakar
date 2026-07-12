// @ts-nocheck
// supabase/functions/create-medecin/index.ts
//
// Edge Function : crée un compte médecin (Auth + table utilisateurs).
// Tourne côté serveur Supabase — c'est ICI que la clé service_role est
// utilisée, jamais dans le navigateur.
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
      return json({ error: "Seul un administrateur peut créer un compte médecin." }, 403)
    }

    const body = await req.json()
    const { prenom, nom, email, password, specialite, telephone, tarif } = body

    if (!prenom || !nom || !email || !password || !specialite) {
      return json({ error: 'Champs obligatoires manquants.' }, 400)
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

    const { error: updateError } = await adminClient
      .from('utilisateurs')
      .update({
        specialite,
        telephone: telephone || null,
        tarif: tarif ? Number(tarif) : 25000,
      })
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