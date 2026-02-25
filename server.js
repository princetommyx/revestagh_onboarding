const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve frontend static files from the same directory
app.use(express.static(__dirname));

// Database setup
const db = new sqlite3.Database('./revesta.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create table
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            role TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// API Endpoints

// Add a new lead
app.post('/api/leads', (req, res) => {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !phone || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO leads (name, email, phone, role) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, email, phone, role], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to save lead' });
        }
        res.status(201).json({ id: this.lastID, message: 'Lead captured successfully' });
    });
});

// Get all leads (for admin dashboard)
app.get('/api/leads', (req, res) => {
    const query = `SELECT * FROM leads ORDER BY timestamp DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to fetch leads' });
        }
        res.status(200).json(rows);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin Dashboard available at http://localhost:${PORT}/admin.html`);
});
