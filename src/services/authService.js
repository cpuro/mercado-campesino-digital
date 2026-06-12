/**
 * Authentication Service
 * 
 * ✅ Usa API Gateway (sin credenciales de BD)
 * Maneja toda la lógica de autenticación
 * Separada de UI y state management
 * 
 * Responsabilidades:
 * - Sign up / Sign in / Sign out
 * - Validación de credenciales
 * - Gestión de sesiones
 */

import { authClient } from '@/lib/supabase'

class AuthService {
  /**
   * Registra un nuevo usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @param {string} role - Rol: 'admin' | 'producer' | 'consumer'
   * @param {string} firstName - Nombre
   * @param {string} lastName - Apellido
   */
  async signUp(email, password, role = 'consumer', firstName = '', lastName = '') {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Email inválido')
      }
      if (!this.validatePassword(password)) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }

      const data = await authClient.signUp(email, password, role, firstName, lastName)

      return {
        success: true,
        user: data.user,
        message: 'Cuenta creada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email 
   * @param {string} password 
   */
  async signIn(email, password) {
    try {
      const data = await authClient.signIn(email, password)

      return {
        success: true,
        user: data.user,
        role: data.role,
        token: data.session?.access_token
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Cierra la sesión actual
   */
  async signOut() {
    try {
      authClient.signOut()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Obtiene la sesión actual
   */
  async getCurrentSession() {
    try {
      const session = authClient.getCurrentSession()
      
      if (session?.user) {
        return {
          session,
          user: session.user,
          role: session.role || 'consumer'
        }
      }

      return { session: null, user: null, role: null }
    } catch (error) {
      console.error('Error obteniendo sesión:', error.message)
      return { session: null, user: null, role: null }
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser() {
    return authClient.getCurrentUser()
  }

  /**
   * Valida que el email tenga formato correcto
   * @private
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Valida que la contraseña cumpla requisitos mínimos
   * @private
   */
  validatePassword(password) {
    return password && password.length >= 8
  }
}

export const authService = new AuthService()
