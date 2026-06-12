import { create } from 'zustand'
import { userClient } from '@/lib/supabase'

// ✅ Usa API Gateway (seguro - sin credenciales de BD)
export const useProfileStore = create((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null })
      const data = await userClient.getCurrentProfile()
      set({ profile: data, loading: false })
    } catch (err) {
      console.error('Error fetching profile:', err)
      set({ error: err.message, loading: false })
    }
  },

  updateProfile: async (updates) => {
    try {
      set({ loading: true, error: null })
      const data = await userClient.updateProfile(updates)
      set({ profile: data, loading: false })
      return { success: true }
    } catch (err) {
      console.error('Error updating profile:', err)
      set({ error: err.message, loading: false })
      return { success: false, error: err.message }
    }
  },

  clearError: () => set({ error: null }),

  // Limpia el perfil cacheado (al cerrar sesión / cambiar de usuario)
  reset: () => set({ profile: null, loading: false, error: null })
}))
