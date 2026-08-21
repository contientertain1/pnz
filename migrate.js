import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./crypto_app.db');

const columns = ['bitcoin', 'ethereum', 'xrp', 'usdt', 'solana', 'admin_id'];

columns.forEach(col => {
    db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT`, (err) => {
        if (err) console.log(`Column ${col} might already exist or error: ${err.message}`);
        else console.log(`Added column: ${col}`);
    });
});