const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, (req, res) => {

  const cart = req.body;

  console.log('Carrito recibido desde frontend:', cart);


  const token = localStorage.getItem("token");

fetch("http://localhost:3000/cart", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(seleccionados)
})
.then(res => res.json())
.then(data => {
  console.log("Respuesta del backend:", data);
})
.catch(err => {
  console.error("Error enviando carrito:", err);
});

  res.json({
    message: 'Carrito recibido correctamente',
    receivedAt: new Date().toISOString()
  });
});

module.exports = router;