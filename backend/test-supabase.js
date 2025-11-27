// Script de prueba para verificar la conexión con Supabase
require('dotenv').config();
const supabase = require('./supabaseClient');

async function testConnection() {
    console.log('🔍 Verificando conexión con Supabase...\n');

    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurado' : '❌ No configurado');
    console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurado' : '❌ No configurado');
    console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado');
    console.log('');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Configura las variables de entorno en el archivo .env');
        console.log('\n📖 Lee el archivo SUPABASE_README.md para instrucciones completas');
        return;
    }

    try {
        // Intentar consultar la tabla users
        console.log('🔗 Intentando conectar con Supabase...');
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            if (error.message.includes('relation "users" does not exist')) {
                console.error('❌ Error: La tabla "users" no existe');
                console.log('   Ejecuta el archivo supabase_setup.sql en el SQL Editor de Supabase');
            } else {
                console.error('❌ Error al conectar:', error.message);
            }
            return;
        }

        console.log('✅ Conexión exitosa con Supabase!');
        console.log('✅ La tabla "users" existe y es accesible');
        
        // Contar usuarios
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (!countError) {
            console.log(`📊 Usuarios registrados: ${count || 0}`);
        }

        console.log('\n✅ Todo está listo para usar Supabase!');
        console.log('   Puedes iniciar el servidor con: npm start');

    } catch (err) {
        console.error('❌ Error inesperado:', err.message);
    }
}

testConnection();
