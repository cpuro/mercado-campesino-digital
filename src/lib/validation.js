/**
 * Validation Schemas - Frontend
 * 
 * ✅ Validación centralizada con Zod
 * Protege contra inyección de datos y XSS
 * 
 * Uso:
 *   const result = loginSchema.safeParse(formData)
 *   if (!result.success) { console.log(result.error.flatten()) }
 */

import { z } from 'zod'

// ============================================================
// DOMINIOS DE CORREO PERMITIDOS (seguridad en el registro)
// ============================================================
// Solo se permite registrarse con proveedores de correo conocidos.
// Editar esta lista para agregar/quitar dominios.
export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'hotmail.es',
  'outlook.com',
  'outlook.es',
  'live.com',
  'yahoo.com',
  'yahoo.es',
  'icloud.com',
]

/**
 * Verifica que el dominio del email esté en la lista permitida.
 * @param {string} email
 * @returns {boolean}
 */
export function isAllowedEmailDomain(email) {
  if (typeof email !== 'string') return false
  const domain = email.split('@')[1]?.toLowerCase().trim()
  return ALLOWED_EMAIL_DOMAINS.includes(domain)
}

// ============================================================
// AUTENTICACIÓN
// ============================================================

export const loginSchema = z.object({
  email: z
    .string('Email es requerido')
    .min(1, 'Email es requerido')
    .email('Email inválido'),
  password: z
    .string('Contraseña es requerida')
    .min(1, 'Contraseña es requerida')
    .min(8, 'Contraseña debe tener al menos 8 caracteres'),
})

export const registerSchema = z.object({
  email: z
    .string('Email es requerido')
    .min(1, 'Email es requerido')
    .email('Email inválido')
    .max(255, 'Email muy largo')
    .refine(isAllowedEmailDomain, 'Usa un correo de un proveedor válido (Gmail, Outlook, Hotmail, Yahoo o iCloud)'),
  password: z
    .string('Contraseña es requerida')
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Debe contener al menos un carácter especial'),
  confirmPassword: z
    .string('Confirmación de contraseña es requerida'),
  firstName: z
    .string('Nombre es requerido')
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'Nombre contiene caracteres inválidos'),
  lastName: z
    .string('Apellido es requerido')
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'Apellido contiene caracteres inválidos'),
  phone: z
    .string('Celular es requerido')
    .min(1, 'Celular es requerido')
    .regex(/^\+?[0-9]{7,15}$/, 'Número de celular inválido (solo dígitos, 7 a 15)'),
  role: z.enum(['producer', 'consumer'], 'Rol inválido'),
  acceptTerms: z.boolean().refine(val => val === true, 'Debes aceptar los términos'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// ============================================================
// PRODUCTOS
// ============================================================

export const productSchema = z.object({
  name: z
    .string('Nombre del producto es requerido')
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre muy largo')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-()&.,]+$/, 'Nombre contiene caracteres inválidos'),
  description: z
    .string()
    .max(500, 'Descripción muy larga')
    .optional(),
  price: z
    .number()
    .positive('Precio debe ser mayor a 0')
    .max(999999, 'Precio no puede ser tan alto'),
  quantity_value: z
    .number()
    .positive('Cantidad debe ser mayor a 0')
    .max(999999, 'Cantidad no puede ser tan alta'),
  quantity_unit: z
    .enum(['unidades', 'kg', 'litros', 'docenas', 'paquetes'])
    .default('unidades'),
  quantity_notes: z
    .string()
    .max(100, 'Notas muy largas')
    .optional(),
  availability_frequency: z
    .enum(['diaria', 'semanal', 'quincenal', 'mensual', 'puntual'])
    .default('puntual'),
  category: z
    .string('Categoría es requerida')
    .min(2, 'Categoría inválida')
    .max(50, 'Categoría muy larga'),
  is_organic: z
    .boolean()
    .optional()
    .default(false),
})

// ============================================================
// PERFIL DE USUARIO
// ============================================================

export const profileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'Nombre contiene caracteres inválidos'),
  last_name: z
    .string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, 'Apellido contiene caracteres inválidos'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Teléfono inválido')
    .optional(),
  address: z
    .string()
    .max(200, 'Dirección muy larga')
    .optional(),
})

// ============================================================
// BÚSQUEDA Y FILTROS
// ============================================================

export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Búsqueda muy larga')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-()&.,]*$/, 'Búsqueda contiene caracteres inválidos')
    .optional(),
  category: z
    .string()
    .max(50)
    .optional(),
  minPrice: z
    .number()
    .positive()
    .optional(),
  maxPrice: z
    .number()
    .positive()
    .optional(),
  page: z
    .number()
    .int()
    .positive()
    .default(1),
})

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Valida datos y retorna errores formateados
 * @param {Object} schema - Schema Zod
 * @param {Object} data - Datos a validar
 * @returns {Object} { valid: boolean, errors: {} | undefined, data: Object }
 */
export function validateData(schema, data) {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = {}
    if (result.error && result.error.issues) {
      result.error.issues.forEach(error => {
        const path = error.path.join('.')
        errors[path] = error.message
      })
    }
    return { valid: false, errors, data: null }
  }
  
  return { valid: true, errors: undefined, data: result.data }
}

/**
 * Sanitiza strings para evitar XSS
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str
  
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim()
}

/**
 * Valida y sanitiza todos los campos string de un objeto
 * @param {Object} obj - Objeto a procesar
 * @returns {Object} Objeto con strings sanitizados
 */
export function sanitizeData(obj) {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}
