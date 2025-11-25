const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PUERTO = 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Servir archivos estáticos desde el directorio 'json'
// La ruta URL será /emercado-api, mapeando a la carpeta local 'json'
app.use('/emercado-api', express.static(path.join(__dirname, 'json')));

// Servir archivos estáticos del frontend desde la raíz del proyecto
app.use(express.static(path.join(__dirname, '..')));

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
