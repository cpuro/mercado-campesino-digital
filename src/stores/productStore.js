import { create } from 'zustand'
import { productClient } from '@/lib/supabase'

// ✅ Usa API Gateway (seguro - sin credenciales de BD)
export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (page = 0, limit = 20) => {
    try {
      set({ loading: true, error: null })
      const data = await productClient.getProducts(page, limit)
      set({ products: data.data  || [] })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchProductById: async (id) => {
    try {
      set({ loading: true, error: null })
      const data = await productClient.getProductById(id)
      return data
    } catch (error) {
      set({ error: error.message })
      return null
    } finally {
      set({ loading: false })
    }
  },

  addProduct: async (productData) => {
    try {
      set({ loading: true, error: null })
      const data = await productClient.createProduct(productData)
      set({ products: [data, ...get().products] })
      return { success: true }
    } catch (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null })
      await productClient.deleteProduct(id)
      set({ products: get().products.filter(p => p.id !== id) })
      return { success: true }
    } catch (error) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  }
}))
