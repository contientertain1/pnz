import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Врската се воспоставува преку DATABASE_URL од .env
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
    ssl: connectionString && connectionString.includes('sslmode=require') 
        ? { rejectUnauthorized: false } 
        : false
});

// Функција за автоматско креирање на табелите и првиот админ
export const initDb = async () => {
    if (!connectionString) {
        console.error("ГРЕШКА: DATABASE_URL не е конфигурирана во .env датотеката!");
        return;
    }

    const client = await pool.connect();
    try {
        console.log('Се поврзувам со PostgreSQL базата...');
        
        // Креирање на табелата users со PostgreSQL компатибилни типови
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255),
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(50),
                password VARCHAR(255),
                status VARCHAR(50),
                role VARCHAR(50),
                balance DOUBLE PRECISION DEFAULT 0,
                telegram_agent VARCHAR(255),
                notes TEXT,
                address TEXT,
                bitcoin VARCHAR(255),
                ethereum VARCHAR(255),
                xrp VARCHAR(255),
                usdt VARCHAR(255),
                solana VARCHAR(255),
                admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                activation_fee DOUBLE PRECISION DEFAULT 0,
                paid_amount DOUBLE PRECISION DEFAULT 0,
                bill_price DOUBLE PRECISION DEFAULT 100
            )
        `);

        console.log('Табелата "users" е успешно проверена/креирана.');

        // Креирање на почетен администратор доколку табелата е празна
        const adminRes = await client.query("SELECT * FROM users WHERE email = $1", ['admin@crypto.com']);
        if (adminRes.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query(
                `INSERT INTO users (full_name, email, password, role, status, balance) VALUES ($1, $2, $3, $4, $5, $6)`,
                ['System Admin', 'admin@crypto.com', hashedPassword, 'admin', 'Active', 0]
            );
            console.log('Почетниот администратор admin@crypto.com е успешно креиран со лозинка: admin123');
        }
    } catch (err) {
        console.error('Грешка при иницијализација на базата:', err.message);
        throw err;
    } finally {
        client.release();
    }
};

export default pool;