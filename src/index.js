const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// 1. GET: Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const result = await pool.query('SELECT id_usuario, nombre, email, created_at FROM usuario');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Obtener usuario por ID
app.get('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT id_usuario, nombre, email, created_at FROM usuario WHERE id_usuario = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. POST: Crear un usuario
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const query = 'INSERT INTO usuario (nombre, email, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email, created_at';
        const values = [nombre, email, password];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT: Actualizar usuario
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password } = req.body;
        const query = 'UPDATE usuario SET nombre = $1, email = $2, password = $3 WHERE id_usuario = $4 RETURNING id_usuario, nombre, email, created_at';
        const values = [nombre, email, password, id];

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para actualizar.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. DELETE: Eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para eliminar.' });
        }
        res.json({ mensaje: 'Usuario eliminado correctamente', id_usuario: result.rows[0].id_usuario });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});