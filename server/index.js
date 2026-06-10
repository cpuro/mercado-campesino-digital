import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { z } from 'zod'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const app = express()
const PORT = process.env.PORT || 3001

// ============================================================
// MIDDLEWARE DE SEGURIDAD
// ============================================================

// Helmet para headers de seguridad
app.use(helmet())

// CORS restrictivo
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body parser
app.use(express.json({ limit: '1mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// ============================================================
// SUPABASE CLIENT (con SERVICE_KEY - secreto)
// ============================================================

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados')
  process.exit(1)
}

// Cliente con SERVICE_KEY (nunca se expone al cliente)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================================
// SCHEMAS DE VALIDACIÓN (Zod)
// ============================================================

const productSchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  price: z.number().positive('Precio debe ser positivo'),
  quantity: z.number().int().positive('Cantidad debe ser positiva'),
  category: z.string().min(2, 'Categoría es requerida'),
  is_organic: z.boolean().optional(),
})

const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[0-9]/, 'Debe contener número')
    .regex(/[!@#$%^&*]/, 'Debe contener carácter especial'),
  role: z.enum(['producer', 'consumer', 'admin']),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
})

// ============================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================

const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' })
    }

    // Verificar JWT con SERVICE_KEY
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    req.user = data.user
    next()
  } catch (err) {
    res.status(500).json({ error: 'Error verificando autenticación' })
  }
}

// ============================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================

// Sign Up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const validData = signUpSchema.parse(req.body)

    const { data, error } = await supabase.auth.admin.createUser({
      email: validData.email,
      password: validData.password,
      email_confirm: false,
      user_metadata: {
        first_name: validData.first_name,
        last_name: validData.last_name,
      },
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    // Crear perfil en tabla users
    const { error: profileError } = await supabase.from('users').insert({
      id: data.user.id,
      email: validData.email,
      role: validData.role,
      first_name: validData.first_name,
      last_name: validData.last_name,
    })

    if (profileError) {
      return res.status(400).json({ error: profileError.message })
    }

    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    res.status(500).json({ error: 'Error en registro' })
  }
})

// Sign In
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    res.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        expires_in: data.session.expires_in,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Error en login' })
  }
})

// ============================================================
// RUTAS DE PRODUCTOS
// ============================================================

// GET todos los productos (público, con paginación)
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '0')
    const limit = parseInt(req.query.limit || '20')
    const offset = page * limit

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      data,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    })
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo productos' })
  }
})

// GET producto por ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo producto' })
  }
})

// POST crear producto (requiere autenticación)
app.post('/api/products', verifyAuth, async (req, res) => {
  try {
    const validData = productSchema.parse(req.body)

    // Validar que el usuario sea productor
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single()

    if (user?.role !== 'producer') {
      return res.status(403).json({ error: 'Solo productores pueden crear productos' })
    }

    const { data, error } = await supabase.from('products').insert({
      producer_id: req.user.id,
      name: validData.name,
      description: validData.description,
      price: validData.price,
      quantity: validData.quantity,
      category: validData.category,
      is_organic: validData.is_organic || false,
      is_active: true,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data[0])
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    res.status(500).json({ error: 'Error creando producto' })
  }
})

// PUT actualizar producto (solo propietario)
app.put('/api/products/:id', verifyAuth, async (req, res) => {
  try {
    const validData = productSchema.partial().parse(req.body)

    // Verificar que el producto pertenece al usuario
    const { data: product } = await supabase
      .from('products')
      .select('producer_id')
      .eq('id', req.params.id)
      .single()

    if (!product || product.producer_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este producto' })
    }

    const { data, error } = await supabase
      .from('products')
      .update(validData)
      .eq('id', req.params.id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(data[0])
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message })
    }
    res.status(500).json({ error: 'Error actualizando producto' })
  }
})

// DELETE producto (solo propietario)
app.delete('/api/products/:id', verifyAuth, async (req, res) => {
  try {
    // Verificar que el producto pertenece al usuario
    const { data: product } = await supabase
      .from('products')
      .select('producer_id')
      .eq('id', req.params.id)
      .single()

    if (!product || product.producer_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' })
    }

    const { error } = await supabase.from('products').delete().eq('id', req.params.id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Producto eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando producto' })
  }
})

// ============================================================
// RUTAS DE USUARIOS
// ============================================================

// GET perfil del usuario autenticado
app.get('/api/users/me', verifyAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo perfil' })
  }
})

// PUT actualizar perfil
app.put('/api/users/me', verifyAuth, async (req, res) => {
  try {
    const { first_name, last_name, phone, avatar_url } = req.body

    const { data, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        phone,
        avatar_url,
      })
      .eq('id', req.user.id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(data[0])
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando perfil' })
  }
})

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================================
// ERROR HANDLING
// ============================================================

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`\n✅ API Gateway ejecutándose en puerto ${PORT}`)
  console.log(`📝 Documentación: http://localhost:${PORT}/api/docs`)
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health\n`)
})

export default app
