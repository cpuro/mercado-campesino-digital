import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { registerSchema, validateData, sanitizeData } from '@/lib/validation'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
  </svg>
)

const PasswordInput = ({ name, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-base pr-10 ${error ? 'border-red-500' : ''}`}
          required
        />
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">⚠️ {error}</p>}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()
  const { signUp, loading, error: authError } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'consumer',
    acceptTerms: false
  })
  const [validationErrors, setValidationErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    // Limpiar error del campo
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ✅ Validar con Zod
    const validation = validateData(registerSchema, formData)
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    // ✅ Sanitizar datos antes de enviar
    const sanitized = sanitizeData(validation.data)
    
    const result = await signUp(
      sanitized.email,
      sanitized.password,
      sanitized.role,
      sanitized.firstName,
      sanitized.lastName,
      sanitized.phone
    )
    
    if (result.success) {
      // ✅ Mostrar mensaje de éxito
      setSuccessMessage('✅ ¡Usuario registrado exitosamente!')
      
      // ✅ Esperar 2 segundos y luego navegar
      setTimeout(() => {
        if (sanitized.role === 'producer') {
          navigate('/producer')
        } else if (sanitized.role === 'consumer') {
          navigate('/catalog')
        } else {
          navigate('/admin')
        }
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      <div className="absolute inset-0 bg-white opacity-50"></div>
      <div className="card w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Mercado Campesino</h1>
          <p className="text-gray-600">Crea una nueva cuenta</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center font-semibold">
            {successMessage}
          </div>
        )}

        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            ❌ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">¿Eres?</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`input-base ${validationErrors.role ? 'border-red-500' : ''}`}
            >
              <option value="consumer">Consumidor (Quiero comprar)</option>
              <option value="producer">Productor (Quiero vender)</option>
            </select>
            {validationErrors.role && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.role}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`input-base ${validationErrors.firstName ? 'border-red-500' : ''}`}
                placeholder="Juan"
                required
              />
              {validationErrors.firstName && (
                <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`input-base ${validationErrors.lastName ? 'border-red-500' : ''}`}
                placeholder="Pérez"
                required
              />
              {validationErrors.lastName && (
                <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Celular</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`input-base ${validationErrors.phone ? 'border-red-500' : ''}`}
              placeholder="+573001234567"
              required
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.phone}</p>
            )}
          </div>

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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mín. 8 caracteres"
              error={validationErrors.password}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar contraseña</label>
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              error={validationErrors.confirmPassword}
            />
          </div>

          <div>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 cursor-pointer"
                required
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer">
                Acepto los{' '}
                <a 
                  href="/documents/politica-tratamiento-de-datos-paso-a-paso.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  términos y condiciones
                </a>
                {' '}y la{' '}
                <a 
                  href="/documents/aviso-de-privacidad-paso-a-paso.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  política de privacidad
                </a>
              </label>
            </div>
            {validationErrors.acceptTerms && (
              <p className="text-red-500 text-sm mt-2">⚠️ {validationErrors.acceptTerms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || successMessage}
            className="btn-primary w-full"
          >
            {loading ? 'Creando cuenta...' : successMessage ? 'Redirigiendo...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}