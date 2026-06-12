-- ============================================================================
-- POLÍTICAS RLS — Acceso directo Frontend → Supabase
-- ============================================================================
-- Arquitectura: Usuario → Vercel (frontend, anon key) → Supabase (directo)
-- Sin servidor Express. La seguridad depende 100% de estas políticas.
--
-- Ejecutar TODO este script en: Supabase → SQL Editor.
--
-- ⚠️ Acción manual adicional (no es SQL):
--    Supabase → Authentication → Providers → Email → desactivar "Confirm email"
--    (para que el registro inicie sesión de inmediato).
-- ============================================================================


-- ============================================================================
-- TABLA: users
-- ============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone      TEXT;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert" ON users;
DROP POLICY IF EXISTS "Allow service role to insert" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Authenticated can read contact info" ON users;

-- INSERT: el usuario crea su propio perfil durante el registro
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: cada usuario actualiza solo su propio perfil
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SELECT: cualquier usuario autenticado puede leer perfiles.
-- Necesario para que los consumidores obtengan el teléfono (WhatsApp)
-- del productor desde el catálogo.
-- NOTA: esto expone los datos de la tabla users a usuarios autenticados.
-- Si se quiere restringir, mover phone a una vista pública dedicada.
CREATE POLICY "Authenticated can read contact info"
  ON users FOR SELECT TO authenticated
  USING (true);


-- ============================================================================
-- TABLA: products
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can read active products" ON products;
DROP POLICY IF EXISTS "Producers can insert their own products" ON products;
DROP POLICY IF EXISTS "Owners can update their products" ON products;
DROP POLICY IF EXISTS "Owners can delete their products" ON products;

-- SELECT: usuarios autenticados ven los productos activos
CREATE POLICY "Anyone authenticated can read active products"
  ON products FOR SELECT TO authenticated
  USING (is_active = true);

-- INSERT: solo productores, y solo a su propio nombre
CREATE POLICY "Producers can insert their own products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (
    producer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'producer'
    )
  );

-- UPDATE: solo el dueño del producto
CREATE POLICY "Owners can update their products"
  ON products FOR UPDATE TO authenticated
  USING (producer_id = auth.uid())
  WITH CHECK (producer_id = auth.uid());

-- DELETE: solo el dueño del producto
CREATE POLICY "Owners can delete their products"
  ON products FOR DELETE TO authenticated
  USING (producer_id = auth.uid());


-- ============================================================================
-- STORAGE: bucket product-images
-- ============================================================================
-- Crear el bucket público (si no existe).
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;

-- Lectura pública de las imágenes (las URLs públicas que usa el frontend)
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Subida: cualquier usuario autenticado
CREATE POLICY "Authenticated can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');


-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('users', 'products')
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY tablename, cmd;
