import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: 'localhost',
    user: 'root', // replace with your MySQL username
    password: 'sind10', // replace with your MySQL password
    database: 'workers_db' // replace with your database name
};

app.post('/login', async (req, res) => {
    const { matricula, senha } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM membros WHERE matricula = ? AND senha = ?',
            [matricula, senha]
        );

        if (rows.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }

        await connection.end();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

app.post('/register', async (req, res) => {
    const { nome, matricula, senha } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO membros (nome, matricula, senha) VALUES (?, ?, ?)',
            [nome, matricula, senha]
        );

        res.json({ success: true, message: 'Registration successful' });

        await connection.end();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database error', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
