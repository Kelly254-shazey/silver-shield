require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// 1. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 2. DATABASE CONNECTION 
// Ensure these variables match your cPanel MySQL User (not root)
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,      // e.g., eduminco_user
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME   // e.g., eduminco_db
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to the MySQL database.');
});

// 3. SAMPLE ROUTES
app.get('/', (req, res) => {
    res.send('Silver Shield Backend is running.');
});

// Example route for the errors seen in your console logs
app.get('/backend/stories', (req, res) => {
    db.query('SELECT * FROM stories', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 4. DYNAMIC PORT CONFIGURATION
// process.env.PORT is required for cPanel/Passenger environments
// Only start server if not running on Vercel (Vercel uses serverless functions)
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5050;
    
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });

// 5. GRACEFUL SHUTDOWN (Prevents "Address already in use" errors)
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        db.end();
        console.log('Server and DB connection closed.');
        process.exit(0);
    });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
}

module.exports = app;