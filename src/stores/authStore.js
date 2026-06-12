import { create } from 'zustand'
import { authClient } from '@/lib/supabase'
import { useProfileStore } from '@/stores/useProfileStore'

// ✅ Usa API Gateway (seguro - sin credenciales de BD)
export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setError: (error) => set({ error }),

  signUp: async (email, password, role, firstName, lastName, phone) => {
    try {
      set({ loading: true, error: null })
      const data = await authClient.signUp(email, password, role, firstName, lastName, phone)
      set({ user: data.user, role: data.role })
      return { success: true }
    } catch (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const data = await authClient.signIn(email, password)
      set({ user: data.user, role: data.role })
      return { success: true, role: data.role }
    } catch (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      await authClient.signOut()
      useProfileStore.getState().reset()
      set({ user: null, role: null })
    } catch (error) {
      set({ error: error.message })
    }
  },

  initializeAuth: async () => {
    try {
      const session = authClient.getCurrentSession()
      if (session?.user) {
        set({ user: session.user, role: session.role || session.user.role })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  }
}))
