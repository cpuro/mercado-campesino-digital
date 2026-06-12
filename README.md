# 🌾 Mercado Campesino Digital

Plataforma digital de comercio electrónico que conecta productores agrícolas locales con consumidores conscientes. Un marketplace especializado en productos frescos, orgánicos y de calidad directamente del productor.

![Status](https://img.shields.io/badge/Status-En%20Desarrollo-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/Node-18+-blue)
![React](https://img.shields.io/badge/React-18.2+-blue)

---

## ✨ Características Principales

- 🛒 **Catálogo de Productos**: Listado completo de productos agrícolas con filtros y búsqueda
- 👨‍🌾 **Perfiles de Productores**: Información detallada de productores con ratings y contacto
- 🔐 **Autenticación Segura**: Sistema de login con rol de usuario (Admin, Productor, Consumidor)
- 📱 **Integración WhatsApp**: Órdenes y comunicación directa vía WhatsApp
- 💳 **Gestión de Órdenes**: Historial de compras y seguimiento de pedidos
- 📸 **Carga de Imágenes**: Sistema seguro de almacenamiento de imágenes de productos
- 🔍 **Búsqueda y Filtros**: Filtrado por categoría, precio y disponibilidad
- 📊 **Dashboard Admin**: Panel de administración para gestión de usuarios y productos
- 🌐 **Progressive Web App**: Funciona offline como aplicación nativa
- 🎨 **Diseño Responsivo**: Optimizado para móvil, tablet y desktop

## 🎯 Características por Rol

### Para Productores
- Registro y validación de cuenta
- Carga de productos con fotos y detalles
- Panel de control de inventario
- Recepción de pedidos vía WhatsApp
- Seguimiento de ventas

### Para Consumidores
- Catálogo en tiempo real
- Búsqueda y filtrado avanzado
- Comunicación directa con productores
- Historial de compras
- Notificaciones de nuevas ofertas

### Para Administrador
- Validación manual de usuarios
- Monitoreo de plataforma
- Estadísticas y reportes
- Gestión de contenido

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.2.0** - Librería de UI
- **Vite 7.3.1** - Build tool y dev server
- **React Router 6.20.0** - Enrutamiento
- **Tailwind CSS 3.3.6** - Estilos utility-first
- **Zustand 4.4.1** - State management
- **React Icons 5.6.0** - Biblioteca de iconos
- **TypeScript** - Tipado estático (configurado)

### Backend & Database
- **Supabase** - PostgreSQL managed + Auth + Storage
- **Vercel** - Hosting frontend
- **Row Level Security (RLS)** - Políticas de seguridad en BD

### DevOps & Tools
- **Git** - Control de versiones
- **npm/yarn** - Package management
- **Vercel** - CI/CD y deployment
- **Supabase CLI** - Gestión de migraciones

---

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **npm** o **yarn**
- Cuenta en **Supabase** (base de datos)
- Cuenta en **Vercel** (hosting frontend, opcional)

---

## 🚀 Instalación & Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/cpuro/mercado-campesino-app.git
cd mercado-campesino-app
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase (acceso directo desde el frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Obtener estas claves desde tu proyecto Supabase:
- Ir a Settings → API en el dashboard de Supabase
- Copiar `Project URL` y `anon public key`

### 4. Configurar Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Migrar BD
supabase migration up
```

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
mercado-campesino-app/
├── public/                 # Assets estáticos
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service Worker
│   ├── logos/             # Logos de la app
│   └── documents/         # Documentos estáticos
├── src/
│   ├── components/        # Componentes React
│   │   ├── Auth/          # Autenticación
│   │   ├── Products/      # Productos
│   │   ├── Dashboard/     # Dashboards
│   │   └── ...
│   ├── pages/             # Páginas (Router)
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Catalog.jsx
│   │   └── ...
│   ├── services/          # Lógica de negocio
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── uploadService.js
│   │   └── ...
│   ├── stores/            # Zustand stores
│   │   ├── authStore.js
│   │   ├── productStore.js
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # CSS global
│   ├── utils/             # Utilidades
│   ├── App.jsx            # Componente raíz
│   └── main.jsx           # Entry point
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── functions/         # Edge functions
├── .env.local             # Variables de entorno (local)
├── .gitignore             # Git ignore rules
├── package.json           # Dependencias
├── vite.config.js         # Configuración Vite
├── tailwind.config.js     # Configuración Tailwind
├── tsconfig.json          # Configuración TypeScript
└── README.md              # Este archivo
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('producer', 'consumer', 'admin')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `products`
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  category TEXT,
  image_path TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_organic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  consumer_id UUID REFERENCES users(id),
  producer_id UUID REFERENCES users(id),
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `producer_profiles`
```sql
CREATE TABLE producer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  business_name TEXT,
  description TEXT,
  specialty TEXT,
  area TEXT,
  phone TEXT,
  rating DECIMAL(3, 2),
  total_sales INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  business_registration TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Build
npm run build           # Build para producción
npm run preview         # Previsualiza build local

# Linting
npm run lint            # Análisis de código

# Database (Supabase)
supabase migration list  # Ver migraciones
supabase migration up    # Aplicar migraciones
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🔐 Seguridad & Auditoría

⚠️ **Estado Actual**: La aplicación se encuentra en fase de auditoría técnica. Se han identificado vulnerabilidades que deben ser arregladas antes de ir a producción.

### Documentos de Auditoría Disponibles
- `AUDITORIA_TECNICA_COMPLETA.md` - Análisis técnico exhaustivo
- `RESUMEN_EJECUTIVO_AUDITORIA.md` - Resumen para stakeholders
- `GUIA_CODIGO_REMEDIACION.md` - Guía de implementación
- `CHECKLIST_EJECUCION_AUDITORIA.md` - Plan de ejecución

### Recomendación
**NO DESPLEGAR A PRODUCCIÓN** sin completar las fases de remediación crítica (estimado 3-4 semanas).

---

## 🔗 Servicios Principales

### AuthService
Autenticación y gestión de sesiones
```javascript
import { authService } from '@/services/authService'

await authService.signUp(email, password, role)
await authService.signIn(email, password)
await authService.signOut()
```

### ProductService
CRUD de productos
```javascript
import { productService } from '@/services/productService'

const products = await productService.fetchProducts()
const product = await productService.fetchProductById(id)
await productService.createProduct(data)
```

### UploadService
Gestión de imágenes
```javascript
import { uploadService } from '@/services/uploadService'

const url = await uploadService.uploadImage(file)
await uploadService.deleteImage(path)
```

---

## 🌐 Integración WhatsApp

La plataforma integra WhatsApp para comunicación directa:

```javascript
const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
```

---

## 📱 PWA (Progressive Web App)

La aplicación funciona como PWA:
- Instalable en dispositivos
- Funciona offline
- Service Worker
- Manifest.json

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Contacto & Soporte

- **Email**: info@mercadocampesino.com
- **GitHub Issues**: [Issues](https://github.com/cpuro/mercado-campesino-app/issues)

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver LICENSE para más detalles.

---

**Última actualización:** Junio 2026  
**Versión:** 1.0.0-beta  
**Hecho con ❤️ para conectar productores rurales con consumidores urbanos**
