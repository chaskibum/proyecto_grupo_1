const fs = require('fs');
const path = require('path');
const https = require('https');

const URL_BASE = 'https://japceibal.github.io/emercado-api';
const DIR_SALIDA = path.join(__dirname, 'json');

const archivosParaDescargar = [
    'cats/cat.json',
    'sell/publish.json',
    'cart/buy.json',
    'user_cart/25801.json',
    // Productos por categoría
    'cats_products/101.json',
    'cats_products/102.json',
    'cats_products/103.json',
    'cats_products/104.json',
    'cats_products/105.json',
    'cats_products/106.json',
    'cats_products/107.json',
    'cats_products/108.json',
    'cats_products/109.json',
];

// Función auxiliar para descargar un archivo
function descargarArchivo(rutaUrl) {
    const urlCompleta = `${URL_BASE}/${rutaUrl}`;
    const rutaSalida = path.join(DIR_SALIDA, rutaUrl);
    const nombreDir = path.dirname(rutaSalida);

    if (!fs.existsSync(nombreDir)) {
        fs.mkdirSync(nombreDir, { recursive: true });
    }

    https.get(urlCompleta, (res) => {
        if (res.statusCode !== 200) {
            console.error(`Error al descargar ${urlCompleta}: Código de estado ${res.statusCode}`);
            return;
        }

        let datos = '';
        res.on('data', (fragmento) => {
            datos += fragmento;
        });

        res.on('end', () => {
            fs.writeFileSync(rutaSalida, datos);
            console.log(`Descargado: ${rutaUrl}`);

            // Si es una lista de productos de categoría, intentamos descargar la info de cada producto
            // Para simplificar, analizamos la lista y descargamos info y comentarios de cada producto encontrado
            if (rutaUrl.startsWith('cats_products/')) {
                try {
                    const datosJson = JSON.parse(datos);
                    if (datosJson.products) {
                        datosJson.products.forEach(producto => {
                            descargarInfoProducto(producto.id);
                            descargarComentariosProducto(producto.id);
                        });
                    }
                } catch (e) {
                    console.error(`Error al analizar ${rutaUrl} para descubrir productos`);
                }
            }
        });
    }).on('error', (err) => {
        console.error(`Error al descargar ${urlCompleta}: ${err.message}`);
    });
}

function descargarInfoProducto(idProducto) {
    const rutaUrl = `products/${idProducto}.json`;
    const urlCompleta = `${URL_BASE}/${rutaUrl}`;
    const rutaSalida = path.join(DIR_SALIDA, rutaUrl);
    const nombreDir = path.dirname(rutaSalida);

    if (!fs.existsSync(nombreDir)) {
        fs.mkdirSync(nombreDir, { recursive: true });
    }

    // Verificar si ya existe para evitar spam si se llama múltiples veces
    if (fs.existsSync(rutaSalida)) return;

    https.get(urlCompleta, (res) => {
        if (res.statusCode === 200) {
            const archivo = fs.createWriteStream(rutaSalida);
            res.pipe(archivo);
            archivo.on('finish', () => {
                archivo.close();
                console.log(`Info de producto descargada: ${idProducto}`);
            });
        }
    });
}

function descargarComentariosProducto(idProducto) {
    const rutaUrl = `products_comments/${idProducto}.json`;
    const urlCompleta = `${URL_BASE}/${rutaUrl}`;
    const rutaSalida = path.join(DIR_SALIDA, rutaUrl);
    const nombreDir = path.dirname(rutaSalida);

    if (!fs.existsSync(nombreDir)) {
        fs.mkdirSync(nombreDir, { recursive: true });
    }

    if (fs.existsSync(rutaSalida)) return;

    https.get(urlCompleta, (res) => {
        if (res.statusCode === 200) {
            const archivo = fs.createWriteStream(rutaSalida);
            res.pipe(archivo);
            archivo.on('finish', () => {
                archivo.close();
                console.log(`Comentarios de producto descargados: ${idProducto}`);
            });
        }
    });
}

// Iniciar descarga
console.log('Iniciando descarga...');
if (!fs.existsSync(DIR_SALIDA)) {
    fs.mkdirSync(DIR_SALIDA);
}

archivosParaDescargar.forEach(archivo => {
    descargarArchivo(archivo);
});
