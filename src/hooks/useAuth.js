import { useEffect, useCallback, useRef } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import useAuthStore from '../store/authStore'
import { ROLE_REDIRECT } from '../constants/roles'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000

export function useAuth() {
  const store = useAuthStore()
  const inactivityRef = useRef(null)

  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    if (store.user) {
      inactivityRef.current = setTimeout(async () => {
        await signOut(auth)
      }, INACTIVITY_TIMEOUT)
    }
  }, [store.user])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'utilisateurs', firebaseUser.uid))
          const userData = userDoc.exists() ? userDoc.data() : null
          const idTokenResult = await firebaseUser.getIdTokenResult()
          const role =
            idTokenResult.claims?.role || userData?.role || 'patient'
          store.setAuthState({ user: firebaseUser, userData, role })
        } catch (error) {
          store.setAuthState({
            user: firebaseUser,
            userData: null,
            role: 'patient',
          })
        }
      } else {
        store.clearAuth()
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!store.user) return
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ]
    const handleActivity = () => resetInactivityTimer()
    events.forEach((e) => window.addEventListener(e, handleActivity))
    resetInactivityTimer()
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      if (inactivityRef.current) clearTimeout(inactivityRef.current)
    }
  }, [store.user, resetInactivityTimer])

  const login = async (email, motDePasse) => {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      motDePasse
    )
    try {
      await updateDoc(doc(db, 'utilisateurs', credential.user.uid), {
        derniereConnexion: serverTimestamp(),
      })
    } catch {}
    const idTokenResult = await credential.user.getIdTokenResult()
    const userDoc = await getDoc(
      doc(db, 'utilisateurs', credential.user.uid)
    )
    const role =
      idTokenResult.claims?.role || userDoc.data()?.role || 'patient'
    return {
      user: credential.user,
      role,
      redirect: ROLE_REDIRECT[role] || '/',
    }
  }

  const logout = async () => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current)
    await signOut(auth)
  }

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    })
  }

  const createUserProfile = async (uid, data) => {
    await setDoc(doc(db, 'utilisateurs', uid), {
      ...data,
      dateCreation: serverTimestamp(),
      actif: true,
    })
  }

  return {
    user: store.user,
    userData: store.userData,
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

export default useAuth