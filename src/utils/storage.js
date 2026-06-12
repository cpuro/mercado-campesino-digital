// storage.js - reemplaza todo el archivo
export const getProductImageUrl = (path) => {
  if (!path) return null

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}