// Hook de React para manejar estado local
import { useState } from 'react'

// Hook para redirigir entre rutas
import { useNavigate } from 'react-router-dom'

// Store de autenticación (usuario actual)
import { useAuthStore } from '@/stores/authStore'

// Store de productos (acción para crear y estado de guardado)
import { useProductStore } from '@/stores/productStore'

// Sanitización del nombre
import { sanitizeString } from '@/lib/validation'

// Función que sube la imagen del producto a Supabase Storage
import { uploadProductImage } from '@/lib/supabase'

// Tamaño máximo permitido para la imagen (300 KB)
const MAX_IMAGE_SIZE = 300 * 1024

// Tipos de imagen permitidos
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Componente para publicar un nuevo producto (solo nombre + foto)
export default function CreateProduct() {

  // Función para redirigir entre páginas
  const navigate = useNavigate()

  // Usuario autenticado (productor que publica)
  const { user } = useAuthStore()

  // Acción para crear el producto y estado de guardado
  const { addProduct, loading } = useProductStore()

  // Nombre del producto
  const [name, setName] = useState('')

  // Imagen seleccionada por el usuario
  const [imageFile, setImageFile] = useState(null)

  // Errores de validación por campo
  const [validationErrors, setValidationErrors] = useState({})

  // Error general del formulario
  const [error, setError] = useState(null)

  // Indica si la imagen se está subiendo
  const [uploading, setUploading] = useState(false)

  /**
   * Valida la imagen seleccionada (tipo y tamaño) antes de aceptarla.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Rechaza formatos no permitidos
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setValidationErrors(prev => ({ ...prev, image: 'Solo se permiten imágenes JPG, PNG o WebP' }))
      return
    }

    // Rechaza imágenes que superan el tamaño máximo
    if (file.size > MAX_IMAGE_SIZE) {
      setValidationErrors(prev => ({ ...prev, image: 'La imagen no debe superar los 300 KB' }))
      return
    }

    // Guarda la imagen y limpia el error de imagen
    setImageFile(file)
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.image
      return newErrors
    })
  }

  /**
   * Valida el nombre, sube la imagen (si hay) y crea el producto.
   * Los demás campos se guardan con valores por defecto.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Valida el nombre (requerido, al menos 3 caracteres)
    const cleanName = sanitizeString(name)
    if (!cleanName || cleanName.length < 3) {
      setValidationErrors({ name: 'El nombre debe tener al menos 3 caracteres' })
      return
    }

    try {
      // Ruta de la imagen (null si no se sube ninguna)
      let imagePath = null

      // Sube la imagen directo a Supabase Storage si existe
      if (imageFile) {
        setUploading(true)
        const uploadData = await uploadProductImage(imageFile, user.id)
        imagePath = uploadData.path
        setUploading(false)
      }

      // Crea el producto con valores por defecto en los campos no usados
      // (price y category son NOT NULL en la base de datos).
      const result = await addProduct({
        name: cleanName,
        description: null,
        price: 0,
        quantity: null,
        quantity_notes: null,
        availability_frequency: null,
        category: 'otros',
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

  // True mientras se guarda el producto o se sube la imagen
  const isSubmitting = loading || uploading

  return (
    <div className="min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      {/* Capa blanca semitransparente sobre el fondo */}
      <div className="absolute inset-0 bg-white opacity-10"></div>

      <div className="max-w-2xl mx-auto p-4 relative z-10">
      {/* Encabezado */}
      <h1 className="text-3xl font-bold mb-2">Publicar nuevo producto</h1>
      <p className="text-black mb-6">Agrega el nombre y una foto de tu producto</p>

      {/* Mensaje de error general */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="card space-y-6">

        {/* Nombre del producto */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del producto *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (validationErrors.name) setValidationErrors({})
            }}
            placeholder="Ej: Plátano, Huevos criollos, Queso..."
            className={`input-base ${validationErrors.name ? 'border-red-500' : ''}`}
            required
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1"> {validationErrors.name}</p>
          )}
        </div>

        {/* Imagen del producto */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Foto del producto (máx 300 KB - JPG, PNG, WebP)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageChange}
            className={`input-base ${validationErrors.image ? 'border-red-500' : ''}`}
          />
          {validationErrors.image && (
            <p className="text-red-500 text-sm mt-1"> {validationErrors.image}</p>
          )}
          {uploading && (
            <p className="text-blue-500 text-sm mt-1"> Subiendo imagen...</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {uploading ? 'Subiendo imagen...' : loading ? 'Publicando...' : ' Publicar producto'}
          </button>
          <button type="button" onClick={() => navigate('/producer')} className="btn-ghost flex-1">
            Cancelar
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}
