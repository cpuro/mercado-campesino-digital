import { useState, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { loginSchema, validateData, sanitizeData } from '@/lib/validation'
import { authClient } from '@/lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, loading, error: authError } = useAuthStore()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  
  // Estado para verificación de usuario (opcional)
  const [userStatus, setUserStatus] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const verifyTimeoutRef = useRef(null)
  
  // Flag para deshabilitar verificación si hay problemas
  const enableEmailVerification = false

  // Función para verificar si el usuario existe
  const verifyEmail = useCallback(async (email) => {
    if (!email || !email.includes('@')) {
      setUserStatus(null)
      setUserInfo(null)
      return
    }

    try {
      setUserStatus('loading')

      const result = await authClient.verifyUserExists(email)
      
      if (result.error) {
        // Si hay error en la verificación, simplemente no mostrar nada
        setUserStatus(null)
        setUserInfo(null)
      } else if (result.exists) {
        setUserStatus('exists')
        setUserInfo(result.user)
      } else {
        setUserStatus('not_found')
        setUserInfo(null)
      }
    } catch (error) {
      console.error('Error verificando email:', error)
      // Silenciar error de verificación para no bloquear el formulario
      setUserStatus(null)
      setUserInfo(null)
    }
  }, [])

  // Debounce para la verificación (espera 500ms después de escribir)
  const handleEmailChange = (e) => {
    const email = e.target.value
    setFormData(prev => ({ ...prev, email }))

    // Limpiar error del campo
    if (validationErrors.email) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }

    // Si la verificación está deshabilitada, no hacer nada
    if (!enableEmailVerification) return

    // Cancelar timeout anterior
    if (verifyTimeoutRef.current) {
      clearTimeout(verifyTimeoutRef.current)
    }

    // Nuevo timeout para verificar (debounce)
    verifyTimeoutRef.current = setTimeout(() => {
      verifyEmail(email)
    }, 300)
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (verifyTimeoutRef.current) {
        clearTimeout(verifyTimeoutRef.current)
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'email') {
      handleEmailChange(e)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      // Limpiar error del campo cuando el usuario empieza a escribir
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[name]
          return newErrors
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ✅ Validar con Zod
    const validation = validateData(loginSchema, formData)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    // ✅ Sanitizar datos antes de enviar
    const sanitized = sanitizeData(validation.data)
    
    const result = await signIn(sanitized.email, sanitized.password)
    if (result.success) {
      const destination =
        result.role === 'admin'
          ? '/admin'
          : result.role === 'producer'
            ? '/producer'
            : '/catalog'

      navigate(destination, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4  bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      <div className="absolute inset-0"></div>
      <div className="card w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Mercado Campesino</h1>
          <p className="text-black">Inicia sesión en tu cuenta</p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-semibold mb-2">❌ {authError}</p>
            {authError.includes('Invalid login credentials') && (
              <p className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className="hover:underline font-semibold text-red-600"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-base ${validationErrors.email ? 'border-red-500' : ''}`}
              placeholder="tu@email.com"
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.email}</p>
            )}
            
            {/* Estado de verificación */}
            {userStatus === 'loading' && formData.email && (
              <div className="flex items-center gap-2 mt-2 text-blue-600">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                <span className="text-sm">Verificando...</span>
              </div>
            )}
            {userStatus === 'exists' && userInfo && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium">
                  ✅ Usuario registrado
                </p>
                <p className="text-green-600 text-xs mt-1">
                  {userInfo.first_name} {userInfo.last_name} • {userInfo.role === 'producer' ? 'Productor' : 'Consumidor'}
                </p>
              </div>
            )}
            {userStatus === 'not_found' && formData.email && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 text-sm font-medium">
                  ⚠️ Usuario no registrado
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  <Link to="/register" className="hover:underline font-semibold">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-base pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  // Ojo cerrado
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                ) : (
                  // Ojo abierto
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm space-y-2">
          <p className="text-gray-600">
            <Link to="/forgot-password" className="text-primary hover:underline font-semibold">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}