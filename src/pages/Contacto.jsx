// Página pública de Contacto
export default function Contacto() {
  return (
    <div className="min-h-screen px-4 py-12 bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      {/* Capa blanca semitransparente sobre el fondo */}
      <div className="absolute inset-0 bg-white opacity-10"></div>

      <div className="max-w-2xl mx-auto p-4 relative z-10">
        <div className="card">
          <img
            src="/logos/LOGOMERCADOCAMPESINO.png"
            alt="Mercado Campesino Digital"
            className="h-32 mx-auto mb-6"
          />

          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Contacto
          </h1>

          <div className="space-y-4 text-gray-700">
            {/* Domicilio */}
            <div>
              <p className="font-semibold text-gray-900">Domicilio</p>
              <p>Carrera 31 #48-29, Barrancabermeja – Santander – Colombia</p>
            </div>

            {/* Celular */}
            <div>
              <p className="font-semibold text-gray-900">Celular</p>
              <p>
                <a href="tel:3156756556" className="text-primary hover:underline">3156756556</a>
                {' - '}
                <a href="tel:3124036429" className="text-primary hover:underline">3124036429</a>
              </p>
            </div>

            {/* Correos */}
            <div>
              <p className="font-semibold text-gray-900">Correos electrónicos</p>
              <p>
                <a href="mailto:contacto@corporacionpasoapaso.com" className="text-primary hover:underline">
                  contacto@corporacionpasoapaso.com
                </a>
              </p>
              <p>
                <a href="mailto:corpasoapaso@hotmail.com" className="text-primary hover:underline">
                  corpasoapaso@hotmail.com
                </a>
              </p>
            </div>

            {/* Página web */}
            <div>
              <p className="font-semibold text-gray-900">Página web</p>
              <p>
                <a
                  href="https://www.corporacionpasoapaso.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  www.corporacionpasoapaso.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
