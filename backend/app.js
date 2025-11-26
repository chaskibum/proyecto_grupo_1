const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const supabase = require('./supabaseClient');

const app = express();
const PUERTO = 3000;

app.use(cors());
app.use(express.json());

// Servir JSON como API
app.use('/emercado-api', express.static(path.join(__dirname, 'json')));

// Servir frontend desde la carpeta anterior
app.use(express.static(path.join(__dirname, '..')));

const usersPath = path.join(__dirname, 'json', 'users.json');

// -----------------------------
//  REGISTRO CON SUPABASE
// -----------------------------
app.post('/register', async (req, res) => {
    const { username, email, password, birthdate } = req.body;

    try {
        // Verificar si el usuario ya existe
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: "Ese usuario ya existe" });
        }

        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (authError) {
            console.error('Error en Supabase Auth:', authError);
            return res.status(400).json({ message: authError.message });
        }

        // Guardar información adicional en la tabla users
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .insert([
                {
                    id: authData.user.id,
                    username: username,
                    email: email,
                    birthdate: birthdate,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Error guardando en BD:', dbError);
            return res.status(400).json({ message: "Error al guardar los datos del usuario" });
        }

        return res.json({ 
            message: "Usuario registrado con éxito",
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// -----------------------------
//  LOGIN CON SUPABASE
// -----------------------------
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Primero buscar el usuario por username para obtener el email
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, email, birthdate')
            .eq('username', username)
            .single();

        if (userError || !userData) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Ahora intentar autenticar con Supabase Auth usando el email
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: password,
        });

        if (authError) {
            console.error('Error de autenticación:', authError);
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // Generar JWT propio (opcional, Supabase ya provee uno)
        const token = jwt.sign(
            { 
                id: userData.id, 
                username: userData.username,
                email: userData.email 
            },
            process.env.JWT_SECRET || "CLAVE_SECRETA_SUPER_SEGURA",
            { expiresIn: "24h" }
        );

        return res.json({ 
            token,
            user: {
                id: userData.id,
                username: userData.username,
                email: userData.email,
                birthdate: userData.birthdate
            },
            supabaseToken: authData.session.access_token
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
});

// -----------------------------

app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});