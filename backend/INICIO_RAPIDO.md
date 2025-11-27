# ⚡ Guía Rápida de Inicio - Supabase

## 🎯 Pasos resumidos

### 1️⃣ Crear proyecto en Supabase
- Ve a https://supabase.com y crea un proyecto
- Copia tus credenciales desde Settings > API

### 2️⃣ Configurar backend
```powershell
# Edita backend/.env con tus credenciales reales
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_KEY=tu_clave_service
```

### 3️⃣ Crear tabla en Supabase
- Ve a SQL Editor en Supabase
- Ejecuta el contenido de `backend/supabase_setup.sql`

### 4️⃣ Probar conexión
```powershell
cd backend
npm run test-supabase
```

### 5️⃣ Iniciar servidor
```powershell
npm start
```

## ✅ ¿Qué ha cambiado?

- **Login**: Ahora usa Supabase Auth (más seguro)
- **Registro**: Crea usuarios en Supabase automáticamente
- **Contraseñas**: Se encriptan automáticamente con bcrypt
- **Base de datos**: PostgreSQL en la nube (Supabase)
- **Sesiones**: Tokens JWT + tokens de Supabase

## 🔧 Todo funciona igual para el usuario

El frontend sigue funcionando exactamente igual. Los cambios son solo en el backend.

## 📚 Documentación completa

Lee `SUPABASE_README.md` para más detalles.
