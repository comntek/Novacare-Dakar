import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  user:        null,
  userData:    null,
  role:        null,
  loading:     true,
  initialized: false,

  // Utilisé dans App.jsx
  setUser: (user) => set({
    user,
    role:        user?.role || null,
    loading:     false,
    initialized: true,
  }),

  setLoading: (loading) => set({ loading }),

  // Ancienne API — gardée pour compatibilité
  setAuthState: ({ user, userData, role }) =>
    set({ user, userData, role, loading: false, initialized: true }),

  clearAuth: () =>
    set({ user: null, userData: null, role: null, loading: false, initialized: true }),

  logout: () =>
    set({ user: null, userData: null, role: null, loading: false, initialized: true }),

  hasRole: (requiredRole) => {
    const { role } = get()
    if (Array.isArray(requiredRole)) return requiredRole.includes(role)
    return role === requiredRole
  },
}))

export default useAuthStore