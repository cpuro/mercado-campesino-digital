import { useEffect, useState } from 'react'
import { useProductStore } from '@/stores/productStore'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/useProfileStore'
import { getProductImageUrl } from '@/utils/storage'
import { openWhatsApp } from '@/utils/whatsapp'
import { userClient } from '@/lib/supabase'
import { Alert } from '@/components/ui'

export default function Catalog() {
  const { products, loading, fetchProducts } = useProductStore()
  const { user } = useAuthStore()
  const { profile, fetchProfile } = useProfileStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [producerPhones, setProducerPhones] = useState({})
  const [alertState, setAlertState] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (user?.id && profile?.id !== user.id) {
      fetchProfile(user.id)
    }
  }, [user?.id, profile, fetchProfile])

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

  const filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory && p.quantity
  })

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
    <div className="min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      <div className="absolute inset-0 bg-white opacity-50"></div>
      <div className="max-w-7xl mx-auto p-4 relative z-10">

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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de productos</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base flex-1"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-base md:w-48"
            >
              <option value="">Todas las categorías</option>
              <option value="aves">🐔 Aves</option>
              <option value="cerdos">🐷 Cerdos</option>
              <option value="bovinos">🐄 Bovinos</option>
              <option value="huevos">🥚 Huevos</option>
              <option value="lacteos">🥛 Lácteos</option>
              <option value="platano">🍌 Plátano</option>
              <option value="maiz">🌽 Maíz</option>
              <option value="yuca">🥔 Yuca/Ñame</option>
              <option value="pesca">🐟 Pesca</option>
              <option value="frutas">🍎 Frutas</option>
              <option value="otros">📦 Otros</option>
            </select>
          </div>
        </div>

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
              <div key={product.id} className="card hover:shadow-md">
                {product.image_path && (
                  <img
                    src={getProductImageUrl(product.image_path)}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-base mb-2">{product.name}</h3>
                {product.description && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                )}
                <div className="mb-4">
                  <p className="text-xl font-bold text-primary">${product.price}</p>
                  <p className="text-xs text-gray-500">Disponible: {product.quantity}</p>
                </div>
                <button
                  onClick={() => handleOrder(product)}
                  className="btn-secondary w-full"
                >
                  📱 Hacer pedido por WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}