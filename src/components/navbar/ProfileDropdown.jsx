import { useState, useEffect, useRef } from 'react'
import { FaUserCircle, FaTimes } from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/useProfileStore'

const ROLE_LABELS = {
  producer: 'Productor',
  consumer: 'Consumidor',
  admin: 'Administrador',
}

export default function ProfileDropdown() {
  const { user, role } = useAuthStore()
  const { profile, loading, error, fetchProfile, updateProfile, clearError } = useProfileStore()

  const [isOpen, setIsOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  })
  const [editError, setEditError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Fetch profile on mount o cuando cambia el usuario logueado
  // (compara por id para no mostrar datos cacheados de otro usuario)
  useEffect(() => {
    if (user?.id && profile?.id !== user.id) {
      fetchProfile(user.id)
    }
  }, [user?.id, profile, fetchProfile])

  // Initialize edit form when profile changes
  useEffect(() => {
    if (profile && isEditModalOpen) {
      setEditForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || ''
      })
    }
  }, [isEditModalOpen, profile])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        setIsEditModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [])

  const handleOpenEditModal = () => {
    setEditError(null)
    setSuccessMessage(null)
    setEditForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || ''
    })
    setIsEditModalOpen(true)
  }

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setEditError(null)

    // Validation
    if (!editForm.first_name.trim()) {
      setEditError('El nombre es requerido')
      return
    }
    if (!editForm.last_name.trim()) {
      setEditError('El apellido es requerido')
      return
    }
    if (editForm.phone && !validatePhoneNumber(editForm.phone)) {
      setEditError('El celular debe tener exactamente 10 dígitos numéricos')
      return
    }

    setIsSaving(true)
    const result = await updateProfile({
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      phone: editForm.phone.trim() || null
    })

    setIsSaving(false)

    if (result.success) {
      setSuccessMessage('Perfil actualizado exitosamente')
      setTimeout(() => {
        setIsEditModalOpen(false)
        setIsOpen(false)
        setSuccessMessage(null)
      }, 1500)
    } else {
      setEditError(result.error || 'Error al guardar el perfil')
    }
  }

  const fullName = profile
    ? `${profile.first_name || 'No registrado'} ${profile.last_name || 'No registrado'}`.trim()
    : 'Cargando...'

  const displayPhone = profile?.phone || 'No registrado'

  const roleLabel = ROLE_LABELS[profile?.role || role] || 'No registrado'

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-white hover:text-primary transition-colors duration-200"
      >
        <FaUserCircle className="text-xl" />
        <span className="hidden sm:inline text-sm">Mi Perfil</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-xl" />
              <span className="font-semibold">Mi Perfil</span>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 space-y-3 max-h-96 overflow-y-auto">
            {/* Email */}
            <div className="pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</p>
              <p className="text-sm text-gray-800 font-medium mt-1">{profile?.email || '-'}</p>
            </div>

            {/* Rol (no editable - definido en el registro) */}
            <div className="pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Rol</p>
              <p className="text-sm text-gray-800 font-medium mt-1">{roleLabel}</p>
            </div>

            {/* Name */}
            <div className="pb-3 border-b border-gray-200">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Nombre Completo</p>
              <p
                className={`text-sm mt-1 font-medium ${
                  profile?.first_name && profile?.last_name ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {fullName === 'No registrado No registrado' ? 'No registrado' : fullName}
              </p>
            </div>

            {/* Phone */}
            <div className="pb-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Celular</p>
              <p
                className={`text-sm mt-1 font-medium ${
                  profile?.phone ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {displayPhone === 'No registrado' ? 'No registrado' : displayPhone}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleOpenEditModal}
              className="w-full btn btn-primary py-2 text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
            >
              Editar perfil
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-96 max-w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Editar Perfil</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="hover:opacity-75 transition-opacity"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    required
                  />
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    placeholder="Tu apellido"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                    required
                  />
                </div>

                {/* Celular */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Celular (10 dígitos)
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="3001234567"
                    maxLength="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Solo números, exactamente 10 dígitos</p>
                </div>

                {/* Error Message */}
                {editError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{editError}</p>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
