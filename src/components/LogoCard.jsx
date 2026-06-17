import './LogoCard.css'

/**
 * Tarjeta 3D reutilizable para mostrar un logo (efecto glass + inclinación al hover).
 *
 * Props:
 * - image: ruta del logo
 * - alt:   texto alternativo
 * - title: (opcional) nombre debajo del logo
 */
export default function LogoCard({ image, alt, title }) {
  return (
    <div className="lc-parent">
      <div className="lc-card">
        <div className="lc-glass"></div>
        <div className="lc-content">
          <img src={image} alt={alt || title || 'logo'} className="lc-logo-img" />
          {title && <span className="lc-title">{title}</span>}
        </div>
      </div>
    </div>
  )
}
