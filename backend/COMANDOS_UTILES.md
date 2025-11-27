# 🛠️ Comandos Útiles - Supabase

## 📦 Instalación (ya hecho)
```powershell
cd backend
npm install @supabase/supabase-js dotenv
```

## 🧪 Probar la conexión
```powershell
cd backend
npm run test-supabase
```

## 🚀 Iniciar el servidor
```powershell
cd backend
npm start
```

## 🔄 Reiniciar el servidor
1. Presiona `Ctrl + C` en la terminal
2. Ejecuta `npm start` de nuevo

## 📊 Ver logs del servidor
Los logs aparecen automáticamente en la terminal donde ejecutaste `npm start`

## 🗄️ Comandos SQL útiles en Supabase

### Ver todos los usuarios
```sql
SELECT * FROM public.users;
```

### Contar usuarios
```sql
SELECT COUNT(*) FROM public.users;
```

### Buscar usuario por username
```sql
SELECT * FROM public.users WHERE username = 'Santiago';
```

### Ver usuarios de Supabase Auth
```sql
SELECT * FROM auth.users;
```

### Eliminar un usuario (solo para pruebas)
```sql
-- Primero eliminar de public.users
DELETE FROM public.users WHERE username = 'test_user';

-- Luego eliminar de auth.users (si es necesario)
-- Mejor hacerlo desde el Dashboard > Authentication
```

## 🔍 Verificar configuración

### Ver variables de entorno (sin mostrar valores)
```powershell
cd backend
type .env
```

### Ver dependencias instaladas
```powershell
cd backend
npm list --depth=0
```

### Ver versión de Node.js
```powershell
node --version
```

## 🐛 Debugging

### Si hay error en el login
1. Verificar logs del servidor
2. Abrir consola del navegador (F12)
3. Ver la pestaña "Console" y "Network"

### Si no se crea el usuario
1. Verificar en Supabase Dashboard > Authentication
2. Ver la pestaña "Logs" en Supabase
3. Ejecutar `npm run test-supabase`

### Si hay error de credenciales
1. Verificar que `.env` tiene las credenciales correctas
2. Reiniciar el servidor después de cambiar `.env`

## 📋 Comandos Git

### Ver archivos modificados
```powershell
git status
```

### Agregar archivos al commit
```powershell
git add .
```

### Hacer commit
```powershell
git commit -m "Migración a Supabase completada"
```

### Subir a GitHub
```powershell
git push origin login
```

⚠️ **IMPORTANTE**: Verifica que `.env` NO se suba a GitHub
```powershell
# Debe estar en .gitignore
cat backend\.gitignore
```

## 🔐 Seguridad

### Generar nueva JWT_SECRET
```powershell
# En PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

### Rotar credenciales de Supabase
1. Ve a Supabase Dashboard > Settings > API
2. Haz clic en "Generate new key"
3. Actualiza `.env` con la nueva clave
4. Reinicia el servidor

## 📊 Monitoreo

### Ver requests en tiempo real (Supabase)
1. Ve a Supabase Dashboard
2. Haz clic en "Logs"
3. Selecciona "API"

### Ver usuarios activos
1. Ve a Supabase Dashboard
2. Haz clic en "Authentication"
3. Mira la columna "Last Sign In"

## 🧹 Limpieza

### Eliminar node_modules (si hay problemas)
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Reiniciar base de datos (¡cuidado!)
Ejecuta de nuevo `supabase_setup.sql` pero primero elimina la tabla:
```sql
DROP TABLE IF EXISTS public.users CASCADE;
```
Luego ejecuta todo el contenido de `supabase_setup.sql`

## 💡 Tips

- Usa `npm run test-supabase` antes de iniciar el servidor
- Revisa los logs del servidor cuando algo no funcione
- Abre la consola del navegador (F12) para ver errores del frontend
- En Supabase, la pestaña "Logs" es tu mejor amiga
- Nunca subas `.env` a GitHub
