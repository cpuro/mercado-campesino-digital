// ============================================================
// SUPABASE CLIENT - Acceso directo
// ============================================================
// Arquitectura: Usuario → Vercel (frontend) → Supabase (directo)
//
// 🔑 Usa la ANON KEY (pública por diseño). La seguridad depende
//    de las políticas RLS configuradas en la base de datos.
//    El SERVICE_KEY NUNCA debe estar en el frontend.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el entorno')
}

// Cliente único. supabase-js gestiona la sesión (JWT) y su refresco,
// de modo que RLS se aplica automáticamente en cada query.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ------------------------------------------------------------
// Helpers de persistencia ligera (para lecturas síncronas en
// initializeAuth). supabase-js mantiene su propia sesión aparte.
// ------------------------------------------------------------
const storeLocalUser = (user, role) => {
  const userWithRole = { ...user, role }
  localStorage.setItem('user', JSON.stringify(userWithRole))
  return userWithRole
}

const clearLocalUser = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('auth_token')
}

// ============================================================
// AUTENTICACIÓN
// ============================================================

export const authClient = {
  // Sign Up — registro + perfil en tabla users (sin confirmación de email)
  async signUp(email, password, role, firstName, lastName, phone) {
    const normalizedEmail = email.toLowerCase().trim()

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    })

    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        throw new Error('Este email ya está registrado. Por favor inicia sesión.')
      }
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('No se pudo crear el usuario')
    }

    // Guardar perfil en la tabla users. Se usa upsert porque puede existir
    // un trigger en auth.users que crea la fila automáticamente al registrarse
    // (RLS exige auth.uid() = id tanto para INSERT como para UPDATE).
    const { error: insertError } = await supabase.from('users').upsert(
      {
        id: data.user.id,
        email: normalizedEmail,
        role,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
      },
      { onConflict: 'id' }
    )

    if (insertError) {
      throw new Error(`Error guardando perfil: ${insertError.message}`)
    }

    const userWithRole = storeLocalUser(
      {
        id: data.user.id,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
      },
      role
    )

    return {
      user: userWithRole,
      role,
      session: data.session,
    }
  },

  // Sign In
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.session) {
      throw new Error('Error generando sesión')
    }

    // Leer perfil/rol desde la tabla users
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role || 'consumer'

    const userWithRole = storeLocalUser(
      {
        id: data.user.id,
        email: data.user.email,
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
      },
      role
    )

    return {
      user: userWithRole,
      role,
      session: data.session,
    }
  },

  // Sign Out
  async signOut() {
    await supabase.auth.signOut()
    clearLocalUser()
  },

  // Sesión actual (síncrona, desde localStorage)
  getCurrentSession() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
      const user = JSON.parse(userStr)
      return { user, role: user.role }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error)
      return null
    }
  },

  // Usuario actual (síncrono, desde localStorage)
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  // Verificación de email previa al login (deshabilitada en UI).
  // Con RLS no es posible leer perfiles ajenos desde el cliente.
  async verifyUserExists() {
    return { exists: false }
  },
}

// ============================================================
// PRODUCTOS
// ============================================================

export const productClient = {
  async getProducts(page = 0, limit = 20) {
    const offset = page * limit

    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw new Error(error.message)

    return {
      data: data || [],
      page,
      limit,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    }
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error('Producto no encontrado')
    return data
  },

  async createProduct(productData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Debes iniciar sesión')

    const { data, error } = await supabase
      .from('products')
      .insert({
        producer_id: user.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        quantity_notes: productData.quantity_notes || null,
        availability_frequency: productData.availability_frequency || null,
        category: productData.category,
        image_path: productData.image_path || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return { message: 'Producto eliminado' }
  },
}

// ============================================================
// USUARIOS
// ============================================================

export const userClient = {
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  // Teléfonos de productores por IDs (para el botón de WhatsApp del catálogo)
  async getPhonesByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return []

    const { data, error } = await supabase
      .from('users')
      .select('id, phone')
      .in('id', ids)

    if (error) throw new Error(error.message)
    return data || []
  },
}

// ============================================================
// STORAGE
// ============================================================

// Sube una imagen de producto al bucket y devuelve su path.
export async function uploadProductImage(file, userId) {
  const fileExt = file.name.split('.').pop().toLowerCase()
  const fileName = `products/${userId}-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(error.message)
  return { path: fileName }
}
