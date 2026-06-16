// Página pública "Quiénes Somos"
export default function QuienesSomos() {
  return (
    <div className="min-h-screen px-4 py-12  bg-cover bg-center bg-no-repeat bg-fixed relativ" style={{ backgroundImage: 'url(/logos/fondo.png)' }}>
      {/* Capa blanca semitransparente sobre el fondo */}
      <div className="absolute inset-0"></div>

      <div className="max-w-3xl mx-auto p-4 relative z-10">
        <div className="card">
          <img
            src="/logos/LOGOMERCADOCAMPESINO.png"
            alt="Mercado Campesino Digital"
            className="h-32 mx-auto mb-6"
          />

          <h1 className="text-3xl font-bold text-black mb-4 text-center">
            Quiénes Somos
          </h1>

          <p className="text-black mb-4 leading-relaxed">
            <strong>Mercado Campesino Digital</strong> es una plataforma que conecta
            directamente a los productores rurales con los consumidores urbanos,
            sin intermediarios. Nuestro objetivo es que el campesino reciba un precio
            justo por su trabajo y que las familias accedan a productos frescos y locales.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Nuestra misión</h2>
          <p className="text-black mb-4 leading-relaxed">
            Facilitar la comercialización de productos del campo a través de una
            herramienta sencilla, donde cada productor publica lo que tiene disponible
            y los compradores hacen sus pedidos directamente por WhatsApp.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Cómo funciona</h2>
          <ul className="text-black space-y-2 list-disc list-inside">
            <li>El productor se registra y publica sus productos con foto.</li>
            <li>El consumidor explora el catálogo sin necesidad de registrarse.</li>
            <li>El pedido se coordina directamente con el productor por WhatsApp.</li>
          </ul>

          <p className="text-black mt-8 text-sm text-center">
            Apoyamos la agricultura familiar campesina y el comercio justo.
          </p>
        </div>
      </div>
    </div>
  )
}
