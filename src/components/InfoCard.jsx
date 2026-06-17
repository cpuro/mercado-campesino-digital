import './InfoCard.css'

/**
 * Card informativa reutilizable (estilo Uiverse by Amine-maker):
 * imagen de cabecera + título con icono que rota al hover + etiquetas.
 *
 * Props:
 * - image: ruta de la imagen de cabecera
 * - alt:   texto alternativo de la imagen
 * - title: título de la card
 * - items: array de strings (se muestran como etiquetas)
 */
export default function InfoCard({ image, alt, title, items = [] }) {
  return (
    <div className="ic-wrapper">
      {/* Imagen de cabecera */}
      <div className="ic-container">
        <img src={image} alt={alt || title} />
      </div>

      {/* Cuerpo: título + icono + etiquetas */}
      <div className="ic-info">
        <div className="ic-flex">
          <h3 className="ic-title">{title}</h3>
          {/* Icono que rota al pasar el mouse */}
          <div className="ic-hover">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true">
              <path d="M7 17 17 7M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Cada punto de la lista como etiqueta */}
        <div className="ic-types">
          {items.map((item, i) => (
            <span key={i} className="ic-type">{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
