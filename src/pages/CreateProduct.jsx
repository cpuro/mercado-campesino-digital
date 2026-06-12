import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { productSchema, validateData, sanitizeData } from '@/lib/validation'
import { uploadProductImage } from '@/lib/supabase'

const MAX_IMAGE_SIZE = 300 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function CreateProduct() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addProduct, loading } = useProductStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity_value: '',
    quantity_unit: 'unidades',
    quantity_notes: '',
    availability_frequency: '',
    category: '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'Solo se permiten imágenes JPG, PNG o WebP'
      }))
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setValidationErrors(prev => ({
        ...prev,
        image: 'La imagen no debe superar los 300 KB'
      }))
      return
    }

    setImageFile(file)
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.image
      return newErrors
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const validation = validateData(productSchema, {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      quantity_value: formData.quantity_value ? parseFloat(formData.quantity_value) : null,
    })

    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }

    const sanitized = sanitizeData(validation.data)

    try {
      let imagePath = null

      // ✅ Subir imagen directo a Supabase Storage si existe
      if (imageFile) {
        setUploading(true)
        const uploadData = await uploadProductImage(imageFile, user.id)
        imagePath = uploadData.path
        setUploading(false)
      }

      const quantityString = `${sanitized.quantity_value} ${sanitized.quantity_unit}`

      const result = await addProduct({
        name: sanitized.name,
        description: sanitized.description,
        price: sanitized.price,
        quantity: quantityString,
        quantity_notes: sanitized.quantity_notes,
        availability_frequency: sanitized.availability_frequency,
        category: sanitized.category,
        image_path: imagePath,
        producer_id: user.id,
        created_at: new Date().toISOString(),
      })

      if (result.success) {
        navigate('/producer')
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error(err)
      setUploading(false)
      setError('Error al subir la imagen o guardar el producto')
    }
  }

  const isSubmitting = loading || uploading

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Publicar nuevo producto</h1>
      <p className="text-gray-600 mb-6">Llena los datos de tu producto para publicarlo</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del producto *"
              className={`input-base ${validationErrors.name ? 'border-red-500' : ''}`}
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.name}</p>
            )}
          </div>

          <div>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`input-base ${validationErrors.category ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Categoría *</option>
              <option value="aves">🐔 Aves (Pollo / Gallina)</option>
              <option value="cerdos">🐷 Cerdos</option>
              <option value="bovinos">🐄 Ganadería / Bovinos</option>
              <option value="huevos">🥚 Huevos</option>
              <option value="lacteos">🥛 Lácteos (Leche/Queso)</option>
              <option value="platano">🍌 Plátano</option>
              <option value="maiz">🌽 Maíz</option>
              <option value="yuca">🥔 Yuca / Ñame</option>
              <option value="pesca">🐟 Pesca (Cachama / otros)</option>
              <option value="frutas">🍎 Frutas</option>
              <option value="otros">📦 Otros</option>
            </select>
            {validationErrors.category && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.category}</p>
            )}
          </div>
        </div>

        <div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`input-base ${validationErrors.description ? 'border-red-500' : ''}`}
            placeholder="Descripción del producto (máximo 500 caracteres)"
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.description}</p>
          )}
        </div>

        <div>
          <select
            name="availability_frequency"
            value={formData.availability_frequency}
            onChange={handleChange}
            className={`input-base ${validationErrors.availability_frequency ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Frecuencia de disponibilidad *</option>
            <option value="diaria">📅 Diaria</option>
            <option value="semanal">📅 Semanal</option>
            <option value="quincenal">📅 Quincenal</option>
            <option value="mensual">📅 Mensual</option>
            <option value="puntual">🌱 Puntual</option>
          </select>
          {validationErrors.availability_frequency && (
            <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.availability_frequency}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              name="quantity_value"
              value={formData.quantity_value}
              onChange={handleChange}
              placeholder="Cantidad disponible *"
              className={`input-base ${validationErrors.quantity_value ? 'border-red-500' : ''}`}
              required
              min="0"
              step="0.01"
            />
            {validationErrors.quantity_value && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.quantity_value}</p>
            )}
          </div>

          <div>
            <select
              name="quantity_unit"
              value={formData.quantity_unit}
              onChange={handleChange}
              className={`input-base ${validationErrors.quantity_unit ? 'border-red-500' : ''}`}
              required
            >
              <option value="unidades">Unidades</option>
              <option value="kg">Kilos (kg)</option>
              <option value="litros">Litros</option>
              <option value="docenas">Docenas</option>
              <option value="paquetes">Paquetes</option>
            </select>
            {validationErrors.quantity_unit && (
              <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.quantity_unit}</p>
            )}
          </div>
        </div>

        <div>
          <input
            type="text"
            name="quantity_notes"
            value={formData.quantity_notes}
            onChange={handleChange}
            placeholder="Ej: Disponible según disponibilidad..."
            className={`input-base ${validationErrors.quantity_notes ? 'border-red-500' : ''}`}
          />
          {validationErrors.quantity_notes && (
            <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.quantity_notes}</p>
          )}
        </div>

        <div>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`input-base ${validationErrors.price ? 'border-red-500' : ''}`}
            placeholder="Precio por unidad/kilo *"
            step="0.01"
            required
          />
          {validationErrors.price && (
            <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.price}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Escribe 0 si el precio varía según negociación</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Imagen del producto (máx 300 KB - JPG, PNG, WebP)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
            className={`input-base ${validationErrors.image ? 'border-red-500' : ''}`}
          />
          {validationErrors.image && (
            <p className="text-red-500 text-sm mt-1">⚠️ {validationErrors.image}</p>
          )}
          {uploading && (
            <p className="text-blue-500 text-sm mt-1">⏳ Subiendo imagen...</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {uploading ? 'Subiendo imagen...' : loading ? 'Publicando...' : '📢 Publicar producto'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/producer')}
            className="btn-ghost flex-1"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}