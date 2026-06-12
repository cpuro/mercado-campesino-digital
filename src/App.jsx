import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Navbar from '@/components/Navbar'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Catalog from '@/pages/Catalog'
import CreateProduct from '@/pages/CreateProduct'
import ProducerDashboard from '@/pages/ProducerDashboard'
import AdminDashboard from '@/pages/AdminDashboard'
import Footer from '@/components/Footer';

function App() {
  const { initializeAuth, user, role, loading } = useAuthStore()

  useEffect(() => {
    // Inicializar autenticación solo una vez al montar
    const init = async () => {
      try {
        await initializeAuth()
      } catch (error) {
        console.error('Error inicializando auth:', error)
      }
    }
    init()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      {user && <Navbar />}
      <main className={user ? 'min-h-screen bg-gray-50' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/catalog"
            element={user ? <Catalog /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-product"
            element={user && role === 'producer' ? <CreateProduct /> : <Navigate to="/" />}
          />
          <Route
            path="/producer"
            element={user && role === 'producer' ? <ProducerDashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/admin"
            element={user && role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  )
}

export default App
