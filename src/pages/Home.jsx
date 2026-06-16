import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import ProductBrowser from '@/components/ProductBrowser'
import InfoCard from '@/components/InfoCard'

export default function Home() {
  // Usuario y rol (puede ser null para visitantes anónimos)
  const { user, role } = useAuthStore()

  return (
    <div className="min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      <div className="absolute inset-0 bg-white opacity-10"></div>
      <div className="max-w-7xl mx-auto p-4 relative z-10">

        {/* ===================== HERO ===================== */}
        <div className="text-center mb-10">
          <img
            src="/logos/LOGOMERCADOCAMPESINO.png"
            alt="Mercado Campesino Digital"
            className="h-[182px] mx-auto mb-4"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Mercado Campesino Digital
          </h1>
          <p className="text-xl text-black mb-2">
            Conectamos productores rurales con consumidores urbanos
          </p>
          <p className="text-lg text-black mb-6">
            Compra directamente al productor por WhatsApp.
          </p>

          {/* Accesos según el tipo de visitante */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!user && (
              <>
                <Link to="/login" className="btn-primary text-lg px-8 py-3">
                  Inicia sesión
                </Link>
                <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                  Regístrate como productor
                </Link>
              </>
            )}
            {user && role === 'producer' && (
              <Link to="/producer" className="btn-primary text-lg px-8 py-3">
                Mi panel de productor
              </Link>
            )}
            {user && role === 'admin' && (
              <Link to="/admin" className="btn-primary text-lg px-8 py-3">
                Panel de administrador
              </Link>
            )}
          </div>
        </div>

        {/* ===================== PRODUCTOS ===================== */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">
            Productos disponibles
          </h2>
          <ProductBrowser />
        </div>

        {/* ===================== SECCIONES INFO ===================== */}
        <div className="grid md:grid-cols-3 gap-6">
          <InfoCard
            image="/campesino.png"
            alt="Para productores"
            title="Para Productores"
            items={[
              'Registro sencillo',
              'Carga fácil de productos',
              'Publicar oferta al instante',
              'Recibir pedidos por WhatsApp',
            ]}
          />

          <InfoCard
            image="/consumidor.png"
            alt="Para consumidores"
            title="Para Consumidores"
            items={[
              'Catálogo en tiempo real',
              'Ofertas nuevas diarias',
              'Haz tu pedido por WhatsApp',
              'Productos frescos y locales',
            ]}
          />

          <InfoCard
            image="/beneficios.png"
            alt="Beneficios"
            title="Beneficios"
            items={[
              'Precio justo',
              'Contacto directo',
              'Trazabilidad',
              'Apoyo a lo local',
            ]}
          />
        </div>

      </div>
    </div>
  )
}
