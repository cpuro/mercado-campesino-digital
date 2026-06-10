# 🔐 API Gateway - Solución de Credenciales Expuestas

## Problema Original

❌ **Antes:** Las credenciales de Supabase (anon key) estaban expuestas en el cliente
```javascript
// ❌ INSEGURO - No usar nunca
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
```

### Riesgos
- Acceso directo a la base de datos sin control
- Queries ilimitadas desde el cliente
- Costos de Supabase descontrolados
- Posible exfiltración de datos

---

## ✅ Solución: API Gateway

**Después:** Todas las peticiones pasan por un API Gateway seguro
```
Cliente (React) → API Gateway (Express) → Supabase
    ↑                    ↓
  JWT Token    SERVICE_KEY (secreto)
```

### Ventajas
✅ Credenciales seguras en servidor  
✅ Validación centralizada  
✅ Rate limiting  
✅ Autenticación con JWT  
✅ Auditoría de queries  

---

## 🚀 Implementación

### Paso 1: Instalar Dependencias del Servidor

```bash
cd server
npm install
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-from-supabase
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Obtener SERVICE_KEY:**
1. Ir a Supabase Dashboard → Settings → API
2. Copiar "Service Role" key
3. ⚠️ NUNCA compartir ni commitar esta clave

### Paso 3: Actualizar .env.local del Frontend

```env
# Frontend - Solo URL del API Gateway
VITE_API_BASE_URL=http://localhost:3001/api
```

### Paso 4: Iniciar el Servidor

**Desarrollo:**
```bash
cd server
npm run dev
```

**Producción:**
```bash
cd server
npm start
```

El servidor estará en `http://localhost:3001`

---

## 📝 Uso en el Cliente

### Autenticación

```javascript
import { authClient } from '@/lib/supabase'

// Sign Up
await authClient.signUp(
  'user@email.com',
  'password123',
  'producer',
  'Juan',
  'Pérez'
)

// Sign In
const { user, session } = await authClient.signIn(
  'user@email.com',
  'password123'
)

// El token se guarda automáticamente en localStorage

// Get Current User
const user = authClient.getCurrentUser()

// Sign Out
authClient.signOut()
```

### Productos

```javascript
import { productClient } from '@/lib/supabase'

// Get Products (con paginación)
const { data, page, totalPages } = await productClient.getProducts(0, 20)

// Get Single Product
const product = await productClient.getProductById('product-id')

// Create Product (requiere autenticación)
const newProduct = await productClient.createProduct({
  name: 'Tomate',
  price: 15.50,
  quantity: 100,
  category: 'Vegetales',
  description: 'Tomates frescos',
  is_organic: true,
})

// Update Product (solo propietario)
await productClient.updateProduct('product-id', {
  price: 18.00,
  quantity: 50,
})

// Delete Product (solo propietario)
await productClient.deleteProduct('product-id')
```

### Usuarios

```javascript
import { userClient } from '@/lib/supabase'

// Get Current User Profile
const profile = await userClient.getCurrentProfile()

// Update Profile
await userClient.updateProfile({
  first_name: 'Juan',
  last_name: 'García',
  phone: '+56912345678',
})
```

---

## 🔐 Características de Seguridad

### 1. Rate Limiting
- Máximo 100 requests por 15 minutos por IP
- Automático, sin configuración

### 2. Validación con Zod
Todos los inputs se validan en el servidor:
```javascript
const productSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  category: z.string().min(2),
  is_organic: z.boolean().optional(),
})
```

### 3. Autenticación JWT
- Tokens seguros en localStorage
- Renovación automática
- Validación en cada request

### 4. CORS Restrictivo
- Solo requests desde frontend URL configurado
- Headers de seguridad (Helmet)

### 5. Validación de Autorización
Cada operación verifica:
- Usuario autenticado
- Permisos adecuados
- Propiedad del recurso
```javascript
// Ejemplo: Solo el propietario puede editar
if (product.producer_id !== req.user.id) {
  return res.status(403).json({ error: 'No autorizado' })
}
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/api/health
# Respuesta: {"status":"ok","timestamp":"2026-06-10T..."}
```

### Sign Up
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "role": "consumer",
    "first_name": "Juan",
    "last_name": "Pérez"
  }'
```

### Get Products
```bash
curl http://localhost:3001/api/products?page=0&limit=20
```

### Create Product (con token)
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tomate",
    "price": 15.50,
    "quantity": 100,
    "category": "Vegetales"
  }'
```

---

## 📦 Deploy a Vercel

### Backend (API Gateway)

**Opción 1: Como Proyecto Independiente**

1. Crear repo en GitHub con la carpeta `/server`
2. En Vercel:
   ```
   Framework: Node.js
   Root Directory: server/
   Build Command: npm install
   Start Command: npm start
   ```
3. Agregar Environment Variables en Vercel Dashboard
4. Deploy

**Opción 2: Vercel Functions**

Si prefieres serverless, crear `vercel.json`:
```json
{
  "buildCommand": "npm install && npm run build",
  "public": false,
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### Frontend (React + Vite)

1. En Vercel Dashboard
2. Actualizar `VITE_API_BASE_URL` a URL del API Gateway

---

## ⚠️ Checklist Pre-Producción

- [ ] SERVICE_KEY guardado en Vercel secrets (nunca en git)
- [ ] CORS configurado con domain correcto
- [ ] Rate limiting habilitado
- [ ] HTTPS obligatorio
- [ ] JWT secret rotado
- [ ] Logs de auditoría configurados
- [ ] Health check monitoreado
- [ ] Backup de BD configurado
- [ ] Error monitoring (Sentry/DataDog)
- [ ] Load testing completado

---

## 📚 Archivos Creados

```
server/
├── index.js                 # Servidor Express
├── package.json            # Dependencias
├── .env.example            # Template de variables
└── .env.local              # Variables reales (en .gitignore)

src/
└── lib/
    └── supabase.js         # Cliente seguro (ACTUALIZADO)
```

---

## 🔄 Migración desde Versión Anterior

Si ya tienes código usando `supabase` directamente:

### Antes (Inseguro)
```javascript
import { supabase } from '@/lib/supabase'

const { data } = await supabase
  .from('products')
  .select('*')
```

### Después (Seguro)
```javascript
import { productClient } from '@/lib/supabase'

const { data } = await productClient.getProducts()
```

---

## 📞 Troubleshooting

### Error: "API not reachable"
```bash
# Verificar que el servidor está corriendo
curl http://localhost:3001/api/health
```

### Error: "Token inválido"
- Verificar que SERVICE_KEY es correcto en `.env.local`
- Limpiar localStorage: `localStorage.clear()`

### Error: CORS blocked
- Verificar `FRONTEND_URL` en `.env.local`
- Debe coincidir exactamente con URL del frontend

### Error: Rate limited
- Esperar 15 minutos
- O cambiar IP/VPN

---

## 📊 Monitoreo

Agregar alertas para:
- Errores en servidor API
- Uso de ancho de banda anormal
- Rate limiting activado con frecuencia
- Fallos de autenticación anormales
- Queries lentas a BD

---

**✅ Con esta solución, tus credenciales de BD están seguras y controladas centralmente.**
