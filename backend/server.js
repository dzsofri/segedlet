const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  connectionLimit: process.env.CONNECTIONLIMIT || 10,
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DBNAME
});


// Összes task lekérdezése
app.get('/tasks', (req, res) => {
  pool.query('SELECT * FROM tasks', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba történt az adatok lekérése közben!', details: err.message });
    }
    res.status(200).json(results);
  });
});

// Új task létrehozása
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'A task címe kötelező!' });
  }

  pool.query('INSERT INTO tasks (title) VALUES (?)', [title], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba történt a task mentése közben!' });
    }
    res.status(201).json({ id: result.insertId, title });
  });
});

// Task címének módosítása
app.put('/tasks/:id', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Új cím megadása kötelező!' });
  }

  pool.query('UPDATE tasks SET title=? WHERE id=?', [title, req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba történt a frissítés közben!' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nem található ilyen task!' });
    }

    res.status(200).json({ message: 'Task módosítva.' });
  });
});

// Összes task törlése
app.delete('/tasks', (req, res) => {
  pool.query('DELETE FROM tasks', (err) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba történt a törlés során!' });
    }
    res.status(200).json({ message: 'Minden task törölve.' });
  });
});

// Egy adott task törlése
app.delete('/tasks/:id', (req, res) => {
  pool.query('DELETE FROM tasks WHERE id=?', [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Hiba történt a törlés során!' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Nem található ilyen task!' });
    }

    res.status(200).json({ message: 'Task törölve.' });
  });
});

// Szerver indítása
app.listen(port, () => {
  console.log(`Szerver fut a http://localhost:${port} címen`);
});
