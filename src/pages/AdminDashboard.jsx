import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const { user } = useAuthStore()

  // Productores pendientes de validación (sección deshabilitada por ahora)
  const [pendingProducers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducers: 0,
    totalConsumers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)

    try {
      const { data: allUsers, error } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, role, avatar_url, created_at')

      if (error) throw error

      const producers = allUsers.filter(u => u.role === 'producer')
      const consumers = allUsers.filter(u => u.role === 'consumer')

      setStats({
        totalUsers: allUsers.length,
        totalProducers: producers.length,
        totalConsumers: consumers.length,
      })
    } catch (err) {
      console.error('Error cargando datos:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
        <p className="text-gray-600">Bienvenido, {user?.email}</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="card">
              <h3 className="text-sm text-gray-600 mb-2">Total de usuarios</h3>
              <p className="text-3xl font-bold text-primary">{stats.totalUsers}</p>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-600 mb-2">Productores</h3>
              <p className="text-3xl font-bold text-secondary">{stats.totalProducers}</p>
            </div>

            <div className="card">
              <h3 className="text-sm text-gray-600 mb-2">Consumidores</h3>
              <p className="text-3xl font-bold text-accent">{stats.totalConsumers}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-4">Validar nuevos productores</h2>

            {pendingProducers.length === 0 ? (
              <p className="text-gray-600 text-center py-12">
                No hay productores pendientes de validación
              </p>
            ) : (
              <ul className="divide-y">
                {pendingProducers.map(producer => (
                  <li key={producer.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {producer.avatar_url ? (
                        <img
                          src={producer.avatar_url}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                          {producer.first_name?.[0]}
                          {producer.last_name?.[0]}
                        </div>
                      )}

                      <div>
                        <p className="font-medium">
                          {producer.first_name} {producer.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{producer.email}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
