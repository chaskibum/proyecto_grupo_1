/*
 * ARQUITECTURA DEL SISTEMA CON SUPABASE
 * =====================================
 * 
 * Este archivo documenta cómo funciona el sistema de autenticación
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │                        FRONTEND                             │
 * │  (HTML + JavaScript + CSS)                                  │
 * │                                                             │
 * │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
 * │  │  login.html  │  │registro.html │  │  index.html  │    │
 * │  │  login.js    │  │registro.js   │  │  index.js    │    │
 * │  └──────────────┘  └──────────────┘  └──────────────┘    │
 * │                                                             │
 * │  Guarda en localStorage:                                   │
 * │  - token (JWT propio)                                      │
 * │  - supabaseToken (token de Supabase)                       │
 * │  - sesionActiva                                            │
 * │  - usuarioActivo                                           │
 * │  - userData (info del usuario)                             │
 * └─────────────────────────────────────────────────────────────┘
 *                            │
 *                            │ HTTP POST
 *                            ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    BACKEND (Node.js)                        │
 * │                   http://localhost:3000                     │
 * │                                                             │
 * │  ┌──────────────────────────────────────────────────────┐  │
 * │  │  app.js                                              │  │
 * │  │                                                      │  │
 * │  │  POST /register                                      │  │
 * │  │  - Valida datos                                      │  │
 * │  │  - Crea usuario en Supabase Auth                     │  │
 * │  │  - Guarda datos adicionales en tabla users           │  │
 * │  │                                                      │  │
 * │  │  POST /login                                         │  │
 * │  │  - Busca usuario por username                        │  │
 * │  │  - Autentica con Supabase Auth                       │  │
 * │  │  - Genera JWT                                        │  │
 * │  │  - Devuelve tokens + datos del usuario               │  │
 * │  └──────────────────────────────────────────────────────┘  │
 * │                                                             │
 * │  ┌──────────────────────────────────────────────────────┐  │
 * │  │  supabaseClient.js                                   │  │
 * │  │  - Configuración del cliente de Supabase             │  │
 * │  │  - Lee credenciales desde .env                       │  │
 * │  └──────────────────────────────────────────────────────┘  │
 * └─────────────────────────────────────────────────────────────┘
 *                            │
 *                            │ Supabase SDK
 *                            ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                   SUPABASE (Cloud)                          │
 * │              https://tu-proyecto.supabase.co                │
 * │                                                             │
 * │  ┌─────────────────────┐  ┌──────────────────────────┐    │
 * │  │  Supabase Auth      │  │  PostgreSQL Database     │    │
 * │  │                     │  │                          │    │
 * │  │  - auth.users       │  │  - public.users          │    │
 * │  │    • id (UUID)      │  │    • id (UUID)           │    │
 * │  │    • email          │  │    • username            │    │
 * │  │    • password_hash  │  │    • email               │    │
 * │  │    • created_at     │  │    • birthdate           │    │
 * │  │    • ...más campos  │  │    • created_at          │    │
 * │  │                     │  │    • updated_at          │    │
 * │  │  (Gestión bcrypt)   │  │                          │    │
 * │  └─────────────────────┘  └──────────────────────────┘    │
 * │                                                             │
 * │  Características:                                           │
 * │  ✓ Encriptación automática de contraseñas (bcrypt)         │
 * │  ✓ Row Level Security (RLS)                                │
 * │  ✓ Tokens JWT automáticos                                  │
 * │  ✓ API REST generada automáticamente                       │
 * │  ✓ Backups automáticos                                     │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * 
 * FLUJO DE REGISTRO
 * =================
 * 
 * 1. Usuario completa formulario → registro.html
 * 2. JavaScript envía POST a /register
 * 3. Backend recibe datos
 * 4. Backend llama a supabase.auth.signUp()
 *    → Supabase crea usuario en auth.users
 *    → Supabase hashea la contraseña con bcrypt
 * 5. Backend guarda datos adicionales en public.users
 *    → username, email, birthdate
 * 6. Backend responde con éxito
 * 7. Frontend muestra mensaje y redirige a login
 * 
 * 
 * FLUJO DE LOGIN
 * ==============
 * 
 * 1. Usuario ingresa username + password → login.html
 * 2. JavaScript envía POST a /login
 * 3. Backend busca usuario en public.users por username
 * 4. Backend obtiene el email del usuario
 * 5. Backend llama a supabase.auth.signInWithPassword()
 *    → Supabase valida email + password
 *    → Supabase genera access_token
 * 6. Backend genera su propio JWT
 * 7. Backend responde con:
 *    - token (JWT propio)
 *    - supabaseToken (de Supabase)
 *    - user (datos del usuario)
 * 8. Frontend guarda todo en localStorage
 * 9. Frontend redirige a index.html
 * 
 * 
 * SEGURIDAD
 * =========
 * 
 * ✓ Contraseñas NUNCA se guardan en texto plano
 * ✓ bcrypt automáticamente las hashea
 * ✓ Row Level Security protege los datos
 * ✓ Tokens tienen expiración (24h para JWT, 1h para Supabase)
 * ✓ .env protege las credenciales (no se sube a GitHub)
 * ✓ service_role key solo se usa en backend
 * ✓ anon key es segura para usar en frontend
 * 
 * 
 * VARIABLES DE ENTORNO (.env)
 * ===========================
 * 
 * SUPABASE_URL=https://xxxxx.supabase.co
 * SUPABASE_ANON_KEY=eyJhbGc...  (segura para frontend)
 * SUPABASE_SERVICE_KEY=eyJhbGc...  (SOLO backend, más permisos)
 * JWT_SECRET=tu_clave_secreta
 * 
 */
