# ✅ CHECKLIST: Configuración de Supabase

Sigue estos pasos en orden. Marca cada uno cuando lo completes.

## Paso 1: Crear cuenta en Supabase
- [ ] Ir a https://supabase.com
- [ ] Crear cuenta (si no tienes) o iniciar sesión
- [ ] Crear un nuevo proyecto
  - [ ] Nombre del proyecto: ________
  - [ ] Contraseña de la BD: ________ (guárdala en un lugar seguro)
  - [ ] Región: South America (o la más cercana)
- [ ] Esperar a que el proyecto se cree (2-3 minutos)

## Paso 2: Obtener credenciales
- [ ] En el proyecto, ir a **Settings** ⚙️
- [ ] Hacer clic en **API**
- [ ] Copiar **Project URL**
- [ ] Copiar **anon public** key
- [ ] Hacer clic en "Reveal" junto a **service_role** key y copiarla

## Paso 3: Configurar backend
- [ ] Abrir el archivo `backend/.env`
- [ ] Pegar la Project URL en `SUPABASE_URL`
- [ ] Pegar la anon key en `SUPABASE_ANON_KEY`
- [ ] Pegar la service_role key en `SUPABASE_SERVICE_KEY`
- [ ] Guardar el archivo

## Paso 4: Crear tabla en Supabase
- [ ] En Supabase, ir a **SQL Editor** 
- [ ] Hacer clic en **New Query**
- [ ] Abrir el archivo `backend/supabase_setup.sql`
- [ ] Copiar TODO el contenido
- [ ] Pegarlo en el SQL Editor de Supabase
- [ ] Hacer clic en **Run** (botón verde)
- [ ] Verificar que dice "Success"

## Paso 5: Verificar la configuración
- [ ] Abrir PowerShell/Terminal
- [ ] Ejecutar: `cd backend`
- [ ] Ejecutar: `npm run test-supabase`
- [ ] Verificar que muestra ✅ mensajes de éxito

## Paso 6: Reiniciar el servidor
- [ ] Si el servidor está corriendo, detenerlo (Ctrl+C)
- [ ] Ejecutar: `npm start`
- [ ] Verificar que inicia sin errores

## Paso 7: Probar el sistema
- [ ] Abrir el navegador en `http://localhost:3000`
- [ ] Ir a la página de registro
- [ ] Crear un nuevo usuario de prueba
- [ ] Verificar que el registro fue exitoso
- [ ] Cerrar sesión
- [ ] Iniciar sesión con el usuario creado
- [ ] Verificar que funciona correctamente

## Paso 8: Verificar en Supabase
- [ ] En Supabase, ir a **Authentication**
- [ ] Verificar que aparece el usuario creado
- [ ] Ir a **Table Editor** > **users**
- [ ] Verificar que aparecen los datos del usuario

---

## 🎉 ¡Todo listo!

Si completaste todos los pasos con ✅, tu sistema ahora está usando Supabase.

## 🐛 Si algo no funciona

1. Revisa que las credenciales en `.env` sean correctas
2. Verifica que ejecutaste el SQL en Supabase
3. Ejecuta `npm run test-supabase` para diagnosticar
4. Lee `SUPABASE_README.md` para más ayuda

## 📊 Monitorear tu base de datos

Puedes ver todo en tiempo real en Supabase:
- **Authentication**: Lista de usuarios registrados
- **Table Editor**: Datos en las tablas
- **API Docs**: Documentación automática de tu API
- **Database**: Backup, migrations, etc.
