# 🚀 Configuración de Supabase para el Proyecto

## 📋 Pasos para configurar Supabase

### 1. Crear una cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
   - Elige un nombre para tu proyecto
   - Establece una contraseña segura para la base de datos
   - Selecciona la región más cercana (ejemplo: South America)

### 2. Obtener las credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️) en el menú lateral
2. Haz clic en **API**
3. Copia las siguientes credenciales:
   - **URL del proyecto** (Project URL)
   - **anon public** (clave pública anónima)
   - **service_role** (clave de servicio - úsala solo en el backend)

### 3. Configurar las variables de entorno

Edita el archivo `backend/.env` y reemplaza los valores:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_anon_real_aqui
SUPABASE_SERVICE_KEY=tu_clave_service_real_aqui
JWT_SECRET=CLAVE_SECRETA_SUPER_SEGURA
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a GitHub. Ya está incluido en `.gitignore`.

### 4. Crear la estructura de la base de datos

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Haz clic en **New Query**
3. Copia y pega todo el contenido del archivo `backend/supabase_setup.sql`
4. Haz clic en **Run** para ejecutar el SQL
5. Verifica que la tabla `users` se creó correctamente

### 5. Configurar el frontend (opcional)

Si deseas usar Supabase directamente desde el frontend en el futuro:

1. Edita `js/supabase-config.js`
2. Reemplaza la URL y la clave anónima con tus credenciales reales

```javascript
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co',
    anonKey: 'tu_supabase_anon_key_aqui'
};
```

### 6. Reiniciar el servidor

```powershell
cd backend
npm start
```

## 🔐 Cambios implementados

### Backend (`backend/app.js`)
- ✅ Login ahora usa Supabase Auth
- ✅ Registro crea usuarios en Supabase Auth y guarda datos adicionales en la tabla `users`
- ✅ Se generan tokens JWT para mantener compatibilidad con el sistema actual
- ✅ Las contraseñas se almacenan de forma segura con bcrypt automáticamente por Supabase

### Frontend
- ✅ `js/login.js` actualizado para recibir y guardar tokens de Supabase
- ✅ `js/registro.js` sigue enviando al backend (que ahora usa Supabase)
- ✅ Se guarda información adicional del usuario en localStorage

## 📊 Estructura de la Base de Datos

### Tabla `users`
```sql
- id: UUID (referencia a auth.users)
- username: VARCHAR(50) UNIQUE
- email: VARCHAR(255) UNIQUE
- birthdate: DATE
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Los usuarios solo pueden ver y editar su propia información
- ✅ Las contraseñas se hashean automáticamente con bcrypt
- ✅ Tokens JWT con expiración de 24 horas
- ✅ Variables de entorno protegidas

## 🧪 Probar la integración

1. Intenta registrar un nuevo usuario
2. Verifica en Supabase Dashboard > Authentication que el usuario se creó
3. Verifica en Supabase Dashboard > Table Editor > users que los datos se guardaron
4. Intenta iniciar sesión con ese usuario
5. Verifica que la sesión funciona correctamente

## 📝 Migrar usuarios existentes

Si tienes usuarios en `backend/json/users.json`:

1. Para cada usuario, deberás crear manualmente una cuenta en Supabase Auth:
   - Ve a Authentication > Add User en el dashboard de Supabase
   - Crea la cuenta con el email del usuario
   - Luego inserta los datos adicionales en la tabla `users` usando el UUID generado

2. O bien, pide a los usuarios que se registren de nuevo (recomendado para seguridad)

## 🆘 Solución de problemas

### Error: "SUPABASE_URL no está configurado"
- Asegúrate de haber editado el archivo `.env` con tus credenciales reales

### Error: "relation 'users' does not exist"
- Ejecuta el archivo `supabase_setup.sql` en el SQL Editor de Supabase

### Error al registrar: "Email rate limit exceeded"
- Supabase tiene límites de emails en el plan gratuito
- Ve a Authentication > Email Templates y configura SMTP personalizado si es necesario

### Error: "Invalid API key"
- Verifica que copiaste correctamente las claves desde Settings > API
- Asegúrate de usar `service_role` key en el backend

## 🔗 Recursos útiles

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
