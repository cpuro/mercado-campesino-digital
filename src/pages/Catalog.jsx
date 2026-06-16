// Navegador de productos reutilizable (búsqueda + grilla + WhatsApp)
import ProductBrowser from '@/components/ProductBrowser'

// Página de catálogo (pública). Solo envuelve al ProductBrowser
// dentro del contenedor de pantalla completa con fondo.
export default function Catalog() {
  return (
    <div className="min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      {/* Capa blanca semitransparente sobre el fondo */}
      <div className="absolute inset-0 bg-white opacity-10"></div>

      <div className="max-w-7xl mx-auto p-4 relative z-10">
        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Catálogo de productos</h1>

        {/* Productos */}
        <ProductBrowser />
      </div>
    </div>
  )
}
