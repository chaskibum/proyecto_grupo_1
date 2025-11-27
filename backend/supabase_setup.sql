-- =====================================================
-- CONFIGURACIÓN DE BASE DE DATOS SUPABASE
-- =====================================================
-- Ejecuta estos comandos en el SQL Editor de Supabase
-- (Ve a tu proyecto > SQL Editor > New Query)

-- 1. Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    birthdate DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Crear política para que los usuarios puedan leer su propia información
CREATE POLICY "Los usuarios pueden ver su propia información"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- 4. Crear política para que los usuarios puedan actualizar su propia información
CREATE POLICY "Los usuarios pueden actualizar su propia información"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- 5. Crear política para insertar nuevos usuarios (durante registro)
CREATE POLICY "Permitir inserción durante registro"
    ON public.users
    FOR INSERT
    WITH CHECK (true);

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 7. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- OPCIONAL: Migrar datos existentes desde users.json
-- =====================================================
-- Si tienes usuarios existentes en users.json, tendrás que:
-- 1. Crear manualmente las cuentas en Supabase Auth
-- 2. Luego insertar los datos en la tabla users
-- 
-- Ejemplo:
-- INSERT INTO public.users (id, username, email, birthdate, created_at)
-- VALUES 
--   ('uuid-del-usuario-de-auth', 'Santiago', 'asd@g.com', '1900-03-31', NOW());

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Verifica que la tabla se creó correctamente:
SELECT * FROM public.users;

-- Verifica las políticas RLS:
SELECT * FROM pg_policies WHERE tablename = 'users';
