// Hooks de React
import { useEffect, useState } from 'react'

// Stores
import { useProductStore } from '@/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/useProfileStore'

// Utilidades
import { getProductImageUrl } from '@/utils/storage'
import { openWhatsApp } from '@/utils/whatsapp'
import { userClient } from '@/lib/supabase'

// Alertas
import { Alert } from '@/components/ui'

/**
 * Navegador de productos reutilizable (búsqueda, filtro y compra por WhatsApp).
 * Funciona con o sin sesión: si el visitante es anónimo, el pedido se arma
 * solo con los datos del producto (sin datos del comprador).
 */
export default function ProductBrowser() {
  // Productos y estado de carga (store global)
  const { products, loading, fetchProducts } = useProductStore()

  // Usuario autenticado (puede ser null para visitantes anónimos)
  const { user } = useAuthStore()

  // Perfil del usuario (para autocompletar datos del pedido)
  const { profile, fetchProfile } = useProfileStore()

  // Texto de búsqueda
  const [searchTerm, setSearchTerm] = useState('')

  // Mapa productor -> teléfono
  const [producerPhones, setProducerPhones] = useState({})

  // Alerta en pantalla
  const [alertState, setAlertState] = useState(null)

  // Carga los productos al montar
  useEffect(() => {
    fetchProducts()
  }, [])

  // Si hay usuario y el perfil cargado no corresponde a él, lo consulta
  useEffect(() => {
    if (user?.id && profile?.id !== user.id) {
      fetchProfile(user.id)
    }
  }, [user?.id, profile, fetchProfile])

  // Obtiene los teléfonos de los productores de los productos cargados
  useEffect(() => {
    const fetchProducerPhones = async () => {
      if (products.length === 0) return

      const producerIds = [...new Set(products.map(p => p.producer_id))]

      try {
        const data = await userClient.getPhonesByIds(producerIds)
        const phonesMap = {}
        data?.forEach(u => {
          phonesMap[u.id] = u.phone
        })
        setProducerPhones(phonesMap)
      } catch (error) {
        console.error('Error fetching producer phones:', error)
      }
    }

    fetchProducerPhones()
  }, [products])

  // Filtra por texto de búsqueda (sin exigir cantidad, para productos simples)
  const filtered = products.filter(p => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })

  // Abre WhatsApp con el pedido (datos del comprador opcionales)
  const handleOrder = (product) => {
    const producerPhone = producerPhones[product.producer_id]

    if (!producerPhone) {
      setAlertState({
        type: 'warning',
        title: 'Contacto no disponible',
        message: 'Lo sentimos, el productor aún no ha registrado su número de WhatsApp. Por favor, intenta con otro producto.'
      })
      return
    }

    const consumerData = {
      email: user?.email,
      name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '',
      phone: profile?.phone
    }

    openWhatsApp(producerPhone, {
      productName: product.name,
      quantity: 1,
      price: product.price,
      totalPrice: product.price
    }, consumerData)
  }

  return (
    <div>
      {/* Alerta */}
      {alertState && (
        <div className="mb-6">
          <Alert
            type={alertState.type}
            title={alertState.title}
            message={alertState.message}
            onClose={() => setAlertState(null)}
          />
        </div>
      )}

      {/* Buscador (centrado) */}
      <div className="mb-6 w-full max-w-sm min-w-[200px] mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
          />
          <button
            type="button"
            className="absolute top-1 right-1 flex items-center rounded bg-green-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-2">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
            </svg>
            Buscar
          </button>
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No hay productos disponibles en esta búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className="cursor-pointer group relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg hover:shadow-lg transition-shadow duration-300"
            >
              {/* Imagen con zoom al pasar el mouse */}
              <div className="relative h-56 m-2.5 overflow-hidden rounded-md bg-gray-100">
                {product.image_path ? (
                  <img
                    src={getProductImageUrl(product.image_path)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 transform group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Nombre */}
              <div className="p-4">
                <h6 className="text-slate-800 text-xl font-semibold">{product.name}</h6>
              </div>

              {/* Botón de pedido por WhatsApp (al fondo de la tarjeta) */}
              <div className="px-4 pb-4 pt-0 mt-auto">
                <button
                  type="button"
                  onClick={() => handleOrder(product)}
                  className="w-full rounded-md bg-green-800 py-2 px-4 text-center text-sm font-semibold text-white transition-all shadow-md hover:bg-green-700 hover:shadow-lg active:shadow-none"
                >
                  Hacer pedido por WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
