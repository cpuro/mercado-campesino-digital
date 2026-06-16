/**
 * Card informativa reutilizable (estilo BlogCard):
 * imagen de cabecera + título + lista de puntos.
 *
 * Props:
 * - image: ruta de la imagen de cabecera
 * - alt:   texto alternativo de la imagen
 * - title: título de la card
 * - items: array de strings (puntos de la lista)
 */
export default function InfoCard({ image, alt, title, items = [] }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md flex flex-col">
      {/* Cabecera: imagen a todo el ancho */}
      <img
        src={image}
        alt={alt || title}
        className="w-full h-48 object-cover"
      />

      {/* Cuerpo: título + lista */}
      <div className="p-6 flex-1">
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
        <ul className="text-black space-y-2 list-disc list-inside">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
