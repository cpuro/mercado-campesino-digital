// ============================================================
// API CLIENT - Seguro
// ============================================================
// 🔐 IMPORTANTE: Este cliente NO expone credenciales de BD
// Todas las peticiones van a través del API Gateway (backend)
// Las credenciales de Supabase están seguras en el servidor

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// Helper para fetch con manejo de errores
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Si no autenticado, limpiar token
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Error HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('❌ API Error:', error.message)
    throw error
  }
}

// ============================================================
// MÉTODOS DE AUTENTICACIÓN
// ============================================================

export const authClient = {
  // Sign Up
  async signUp(email, password, role, firstName, lastName) {
    const data = await apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
      }),
    })

    return data
  },

  // Sign In
  async signIn(email, password) {
    const data = await apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (data.session?.access_token) {
      localStorage.setItem('auth_token', data.session.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
    }

    return data
  },

  // Sign Out
  signOut() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  },

  // Get Current Session
  getCurrentSession() {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('user')

    if (!token || !user) return null

    return {
      access_token: token,
      user: JSON.parse(user),
    }
  },

  // Get Current User
  getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
}

// ============================================================
// MÉTODOS DE PRODUCTOS
// ============================================================

export const productClient = {
  // Get All Products
  async getProducts(page = 0, limit = 20) {
    return await apiCall(`/products?page=${page}&limit=${limit}`)
  },

  // Get Product by ID
  async getProductById(id) {
    return await apiCall(`/products/${id}`)
  },

  // Create Product
  async createProduct(productData) {
    return await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  },

  // Update Product
  async updateProduct(id, productData) {
    return await apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  },

  // Delete Product
  async deleteProduct(id) {
    return await apiCall(`/products/${id}`, {
      method: 'DELETE',
    })
  },
}

// ============================================================
// MÉTODOS DE USUARIOS
// ============================================================

export const userClient = {
  // Get Current User Profile
  async getCurrentProfile() {
    return await apiCall('/users/me')
  },

  // Update User Profile
  async updateProfile(profileData) {
    return await apiCall('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },
}

// ============================================================
// HEALTH CHECK
// ============================================================

export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
