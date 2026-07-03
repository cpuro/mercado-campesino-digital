import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { getProductImageUrl } from '@/utils/storage'
import { userClient } from '@/lib/supabase' // ✅ Cambiado: userClient en vez de supabase

// Unidades de medida disponibles para el precio
const PRICE_UNITS = ['unidad', 'libra', 'kilo', 'arroba', 'docena', 'litro', 'bulto']

export default function ProducerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { products, fetchProducts, deleteProduct, updateProduct } = useProductStore()

  // Producto en edición y datos del formulario de edición
  const [editingProduct, setEditingProduct] = useState(null)
  const [editData, setEditData] = useState({ name: '', price: '', unit: 'unidad' })
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const [producerProfile, setProducerProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const [showProfileForm, setShowProfileForm] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  useEffect(() => {
    if (!user?.id) return
    loadProducerProfile()
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    fetchProducts()
  }, [user?.id])

  // ✅ Ahora usa userClient.getCurrentProfile() en vez de supabase.from()
  const loadProducerProfile = async () => {
    try {
      const data = await userClient.getCurrentProfile()

      setProducerProfile(data)

      if (data) {
        setFormData({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          phone: data.phone ?? '',
        })
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
    } finally {
      setProfileLoaded(true)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormError('')
  }

  // ✅ Ahora usa userClient.updateProfile() en vez de supabase.from().update()
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.first_name.trim()) {
      setFormError('El nombre es requerido')
      return
    }
    if (!formData.last_name.trim()) {
      setFormError('El apellido es requerido')
      return
    }
    if (!formData.phone.trim()) {
      setFormError('El número de WhatsApp es requerido')
      return
    }
    if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
      setFormError('Número de WhatsApp inválido')
      return
    }

    try {
      setProfileLoading(true)

      const updated = await userClient.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      })

      setProducerProfile(updated)
      setShowProfileForm(false)
    } catch (err) {
      setFormError(err.message || 'Error al guardar perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  if (!profileLoaded) return null

  const isProfileComplete =
    producerProfile &&
    producerProfile.first_name &&
    producerProfile.last_name &&
    producerProfile.phone

  const handleCreateProduct = () => {
    navigate('/create-product')
  }

  // Abre el modal de edición con los datos del producto
  const openEditProduct = (product) => {
    setEditError('')
    setEditData({
      name: product.name ?? '',
      price: product.price ?? '',
      unit: product.quantity || 'unidad', // la unidad se guarda en la columna quantity
    })
    setEditingProduct(product)
  }

  // Guarda los cambios del producto (nombre, precio y unidad)
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setEditError('')

    const cleanName = editData.name.trim()
    if (cleanName.length < 3) {
      setEditError('El nombre debe tener al menos 3 caracteres')
      return
    }
    const numericPrice = parseFloat(editData.price)
    if (editData.price === '' || isNaN(numericPrice) || numericPrice < 0) {
      setEditError('Ingresa un precio válido (0 o mayor)')
      return
    }

    setEditSaving(true)
    const result = await updateProduct(editingProduct.id, {
      name: cleanName,
      price: numericPrice,
      quantity: editData.unit,
    })
    setEditSaving(false)

    if (result.success) {
      setEditingProduct(null)
    } else {
      setEditError(result.error || 'Error al guardar el producto')
    }
  }

  const userProducts = products.filter(p => p.producer_id === user?.id)

  const fullName = isProfileComplete
    ? `${producerProfile.first_name} ${producerProfile.last_name}`
    : user?.email

  return (
    <div className="min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      <div className="absolute inset-0 bg-white opacity-10"></div>
      <div className="max-w-6xl mx-auto p-4 relative z-10">

        {showProfileForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Información del productor</h2>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleProfileChange}
                  placeholder="Nombre"
                  className="input-base"
                />
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleProfileChange}
                  placeholder="Apellido"
                  className="input-base"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  placeholder="+573001234567"
                  className="input-base"
                />

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1" disabled={profileLoading}>
                    {profileLoading ? 'Guardando...' : 'Guardar perfil'}
                  </button>
                  <button type="button" className="btn-ghost flex-1" onClick={() => setShowProfileForm(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de edición de producto */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Editar producto</h2>

              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {editError}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del producto</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nombre"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Precio y unidad</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={editData.price}
                      onChange={(e) => setEditData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="Ej: 5000"
                      className="input-base w-full sm:flex-1"
                    />
                    <select
                      value={editData.unit}
                      onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
                      className="input-base w-full sm:w-44"
                    >
                      {PRICE_UNITS.map(u => (
                        <option key={u} value={u}>por {u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1" disabled={editSaving}>
                    {editSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  <button type="button" className="btn-ghost flex-1" onClick={() => setEditingProduct(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8 bg-white bg-opacity-10 p-4 rounded-lg shadow">
          <div>
            <h1 className="text-3xl font-bold">Panel del Productor</h1>
            <p className="text-black font-bold">Bienvenido, {fullName}</p>

            {producerProfile?.phone && (
              <p className="text-black font-bol mt-1">
                 WhatsApp: {producerProfile.phone}
              </p>
            )}

            {producerProfile && (
              <button
                onClick={() => setShowProfileForm(true)}
                className="text-black font-bol hover:underline mt-2 block"
              >
               Editar perfil
              </button>
            )}
          </div>

          <button onClick={handleCreateProduct} className="btn-primary">
            Nuevo producto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProducts.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <p className="text-gray-600 mb-4">Aún no tienes productos publicados</p>
              <button onClick={handleCreateProduct} className="btn-primary">
                Publicar tu primer producto
              </button>
            </div>
          ) : (
            userProducts.map(product => (
              <div key={product.id} className="card">
                {product.image_path && (
                  <img
                    src={getProductImageUrl(product.image_path)}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                )}
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="font-bold mt-2 text-green-800">
                  ${product.price}
                  <span className="text-sm font-normal text-gray-500"> / {product.quantity || 'unidad'}</span>
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEditProduct(product)}
                    className="btn-primary flex-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="btn-ghost flex-1"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}