# ⚠️ PROBLEMA DETECTADO: Proyecto de Supabase no accesible

## 🔍 Diagnóstico

El proyecto de Supabase en `https://hwrylfipprpkvdavbfwwr.supabase.co` no es accesible.

**Error**: `No se puede resolver el nombre remoto`

## 🛠️ Soluciones posibles

### Opción 1: Verificar si el proyecto está pausado

1. Ve a https://app.supabase.com
2. Inicia sesión con tu cuenta
3. Busca tu proyecto en la lista
4. Si dice "PAUSED" o "PAUSADO":
   - Haz clic en el proyecto
   - Busca el botón **"Restore"** o **"Reanudar"**
   - Haz clic para reactivarlo
   - Espera 1-2 minutos a que se active

### Opción 2: Verificar la URL del proyecto

1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. Ve a **Settings** ⚙️ > **API**
4. Copia la **Project URL** correcta
5. Reemplázala en `backend/.env`:

```env
SUPABASE_URL=la_url_correcta_aqui
```

### Opción 3: Crear un nuevo proyecto

Si el proyecto fue eliminado o no lo encuentras:

1. Ve a https://app.supabase.com
2. Haz clic en **"New Project"**
3. Completa:
   - **Name**: proyecto_grupo_1 (o el que prefieras)
   - **Database Password**: (usa una contraseña segura y guárdala)
   - **Region**: South America (o la más cercana)
4. Haz clic en **"Create new project"**
5. Espera 2-3 minutos a que se cree
6. Ve a **Settings** > **API** y copia:
   - **Project URL**
   - **anon public** key
   - **service_role** key (haz clic en "Reveal")
7. Actualiza `backend/.env` con las nuevas credenciales
8. Ejecuta el archivo `supabase_setup.sql` en el SQL Editor

## 🧪 Verificar después de solucionar

Después de reactivar o crear el proyecto:

```powershell
cd backend
node test-connection.js
```

Deberías ver: ✅ Conexión exitosa!

## 📋 Checklist de verificación

- [ ] El proyecto existe en https://app.supabase.com
- [ ] El proyecto NO está pausado (debe decir "Active")
- [ ] La URL en `.env` coincide con la de Settings > API
- [ ] Las claves (keys) son correctas
- [ ] Hay conexión a internet
- [ ] El firewall no está bloqueando Supabase

## 💡 Tip

Los proyectos de Supabase en el plan gratuito se pausan después de 1 semana de inactividad. Simplemente reactivalo y seguirá funcionando.
