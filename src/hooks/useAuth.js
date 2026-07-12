import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '../services/supabase'
import { getUtilisateurById } from '../services/firestore'
import useAuthStore from '../store/authStore'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000

const ROUTES_PAR_ROLE = {
  admin: '/admin',
  medecin: '/medecin',
  secretaire: '/secretaire',
  patient: '/patient',
}

export function useAuth() {
  const store = useAuthStore()
  const inactivityRef = useRef(null)

  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    if (store.user) {
      inactivityRef.current = setTimeout(async () => {
        await supabase.auth.signOut()
      }, INACTIVITY_TIMEOUT)
    }
  }, [store.user])

  useEffect(() => {
    const loadProfile = async (sessionUser) => {
      if (!sessionUser) {
        store.setUser(null)
        return
      }
      try {
        const data = await getUtilisateurById(sessionUser.id)
        store.setUser(data ? { ...data, uid: sessionUser.id } : null)
      } catch {
        store.setUser(null)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null)
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!store.user) return
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    const handleActivity = () => resetInactivityTimer()
    events.forEach((e) => window.addEventListener(e, handleActivity))
    resetInactivityTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      if (inactivityRef.current) clearTimeout(inactivityRef.current)
    }
  }, [store.user, resetInactivityTimer])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw mapAuthError(error)

    const userData = await getUtilisateurById(data.user.id)
    if (!userData) throw new Error('Utilisateur introuvable')

    store.setUser({ ...userData, uid: data.user.id })
    return { user: data.user, role: userData.role, redirect: ROUTES_PAR_ROLE[userData.role] || '/' }
  }

  const logout = async () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    await supabase.auth.signOut()
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion`,
    })
    if (error) throw mapAuthError(error)
  }

  const createUserProfile = async ({ prenom, nom, email, password, telephone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { prenom, nom, role: 'patient' } },
    })
    if (error) throw mapAuthError(error)

    const uid = data.user.id

    if (!data.session) {
      return { uid, requiresEmailConfirmation: true }
    }

    if (telephone) {
      await supabase.from('utilisateurs').update({ telephone }).eq('id', uid)
    }

    const numeroDossier = `PAT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`
    await supabase.from('patients').insert({
      id: uid,
      prenom,
      nom,
      telephone,
      email,
      numero_dossier: numeroDossier,
      source: 'app',
    })

    const userData = { uid, prenom, nom, email, telephone, role: 'patient', actif: true }
    store.setUser(userData)
    return { uid, requiresEmailConfirmation: false, userData }
  }

  return {
    user: store.user,
    role: store.role,
    loading: store.loading,
    initialized: store.initialized,
    isAuthenticated: !!store.user,
    hasRole: store.hasRole,
    login,
    logout,
    resetPassword,
    createUserProfile,
  }
}

function mapAuthError(error) {
  const map = {
    'Invalid login credentials': 'Email ou mot de passe incorrect.',
    'Email not confirmed': "Veuillez confirmer votre email avant de vous connecter.",
    'User already registered': 'Cet email est déjà utilisé. Connectez-vous à la place.',
  }
  return new Error(map[error.message] || error.message)
}

export default useAuth