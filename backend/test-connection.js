// Script simple para verificar conexión básica
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Probando conexión básica con Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Key presente:', supabaseKey ? '✅ Sí' : '❌ No');
console.log('');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Faltan credenciales');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        console.log('📡 Intentando hacer ping a Supabase...');
        
        // Intento simple de query
        const { data, error } = await supabase
            .from('_test_')
            .select('*')
            .limit(1);
        
        if (error) {
            if (error.message.includes('does not exist')) {
                console.log('✅ Conexión exitosa! (la tabla _test_ no existe, pero eso es normal)');
                console.log('✅ Supabase está funcionando correctamente');
                console.log('');
                console.log('📝 Siguiente paso: Ejecuta el archivo supabase_setup.sql en el SQL Editor de Supabase');
            } else {
                console.error('⚠️  Error:', error.message);
            }
        } else {
            console.log('✅ Conexión exitosa!');
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.log('');
        console.log('💡 Posibles causas:');
        console.log('   - Verifica que la URL sea correcta');
        console.log('   - Verifica que tengas conexión a internet');
        console.log('   - Verifica que el proyecto de Supabase esté activo');
    }
}

test();
