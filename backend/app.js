const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth');
const cartRoutes = require('./routes/cart');

const app = express();
const PUERTO = 3000;

app.use(cors());
app.use(express.json());
app.use('/cart', authMiddleware, cartRoutes);

// Servir JSON como API
app.use(
  '/emercado-api',
  authMiddleware,
  express.static(path.join(__dirname, 'json'))
);

// Servir frontend desde la carpeta anterior
app.use(express.static(path.join(__dirname, '..')));

const usersPath = path.join(__dirname, 'json', 'users.json');

// -----------------------------
//  REGISTRO
// -----------------------------
app.post('/register', (req, res) => {
    const { username, email, password, birthdate } = req.body;

    let users = [];

    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    const existe = users.find(u => u.username === username);
    if (existe) {
        return res.status(400).json({ message: "Ese usuario ya existe" });
    }

    const newUser = {
        id: Date.now(),
        username,
        email,
        password,      // (sin tocar, vos lo manejás así)
        birthdate
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    return res.json({ message: "Usuario registrado con éxito" });
});

// -----------------------------
//  LOGIN
// -----------------------------
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    let users = [];

    if (fs.existsSync(usersPath)) {
        users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        "CLAVE_SECRETA_SUPER_SEGURA",
        { expiresIn: "1h" }
    );

    return res.json({ token });
});

// -----------------------------

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});