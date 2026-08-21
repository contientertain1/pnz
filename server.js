import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initDb } from './database.js';

dotenv.config();

const app = express();

// Конфигурација на CORS - дозволи го само фронтенд URL-то во продукција
const frontendUrl = process.env.FRONTEND_URL || '*';
app.use(cors({
    origin: frontendUrl
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_2026';
const PORT = process.env.PORT || 5000;

// Иницијализација на база со автоматски табели и првиот админ
initDb().then(() => {
    console.log('Базата на податоци е успешно иницијализирана.');
}).catch((err) => {
    console.error('Неуспешна иницијализација на базата:', err.message);
});

// Middleware за верификација на токен
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid password' });
        
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
        res.json({ token, role: user.role, username: user.full_name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// --- ADMIN CRUD ---
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const result = await pool.query(`
            SELECT id, full_name, email, phone, role, status, balance, 
                   telegram_agent, notes, address, bitcoin, ethereum, xrp, usdt, solana, 
                   admin_id, activation_fee, paid_amount, bill_price 
            FROM users 
            ORDER BY id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

app.post('/api/admin/users', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const { full_name, email, password, role, balance, status, telegram_agent, notes, address, phone, bitcoin, ethereum, xrp, usdt, solana, activation_fee, paid_amount, bill_price } = req.body;
        const hash = await bcrypt.hash(password || 'user123', 10);
        
        const sql = `
            INSERT INTO users (
                full_name, email, password, role, balance, status, telegram_agent, notes, 
                address, phone, bitcoin, ethereum, xrp, usdt, solana, admin_id, 
                activation_fee, paid_amount, bill_price
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            RETURNING id
        `;
        
        const result = await pool.query(sql, [
            full_name, email, hash, role, balance || 0, status || 'Pending', 
            telegram_agent, notes, address, phone, bitcoin, ethereum, xrp, usdt, solana, 
            req.user.id, activation_fee || 0, paid_amount || 0, bill_price || 100
        ]);
        
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating user' });
    }
});

app.put('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        const { full_name, email, phone, balance, status, telegram_agent, address, notes, role, password, bitcoin, ethereum, xrp, usdt, solana, activation_fee, paid_amount, bill_price } = req.body;
        let sql, params;
        
        if (password && !password.startsWith('$2b$') && password !== '•••••• (Encrypted)') {
            const hash = await bcrypt.hash(password, 10);
            sql = `
                UPDATE users SET 
                    full_name=$1, email=$2, phone=$3, balance=$4, status=$5, telegram_agent=$6, 
                    address=$7, notes=$8, role=$9, password=$10, bitcoin=$11, ethereum=$12, 
                    xrp=$13, usdt=$14, solana=$15, activation_fee=$16, paid_amount=$17, bill_price=$18 
                WHERE id=$19
            `;
            params = [
                full_name, email, phone, balance || 0, status, telegram_agent, 
                address, notes, role, hash, bitcoin, ethereum, xrp, usdt, solana, 
                activation_fee || 0, paid_amount || 0, bill_price || 100, req.params.id
            ];
        } else {
            sql = `
                UPDATE users SET 
                    full_name=$1, email=$2, phone=$3, balance=$4, status=$5, telegram_agent=$6, 
                    address=$7, notes=$8, role=$9, bitcoin=$10, ethereum=$11, xrp=$12, 
                    usdt=$13, solana=$14, activation_fee=$15, paid_amount=$16, bill_price=$17 
                WHERE id=$18
            `;
            params = [
                full_name, email, phone, balance || 0, status, telegram_agent, 
                address, notes, role, bitcoin, ethereum, xrp, usdt, solana, 
                activation_fee || 0, paid_amount || 0, bill_price || 100, req.params.id
            ];
        }
        
        await pool.query(sql, params);
        res.json({ message: 'Success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating user' });
    }
});

// --- USER ROUTES ---
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, full_name, email, phone, role, status, balance, 
                   telegram_agent, notes, address, activation_fee, paid_amount, bill_price 
            FROM users 
            WHERE id = $1
        `, [req.user.id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

// --- DELETE USER ---
app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

app.post('/api/user/send-crypto', authenticateToken, async (req, res) => {
    try {
        const { amount } = req.body;
        await pool.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, req.user.id]);
        res.json({ message: 'Success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing transaction' });
    }
});

// --- USER SETTINGS & ADDRESSES ROUTES ---

// 1. Рута за земање на адресите од админот
app.get('/api/user/admin-addresses', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT u2.bitcoin, u2.ethereum, u2.xrp, u2.usdt, u2.solana 
            FROM users u1 
            JOIN users u2 ON u1.admin_id = u2.id 
            WHERE u1.id = $1
        `;
        const result = await pool.query(sql, [req.user.id]);
        res.json(result.rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching admin addresses' });
    }
});

// 2. Рута за ажурирање на профил и лозинка од самиот корисник
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { full_name, phone, address, currentPassword, newPassword } = req.body;
    try {
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];
        
        if (!user) return res.status(400).json({ error: 'User not found' });
        
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Wrong current password!' });
        
        let passToSave = user.password;
        if (newPassword && newPassword.trim() !== '') {
            passToSave = await bcrypt.hash(newPassword, 10);
        }
        
        await pool.query(
            `UPDATE users SET full_name=$1, phone=$2, address=$3, password=$4 WHERE id=$5`,
            [full_name, phone, address, passToSave, req.user.id]
        );
        res.json({ message: 'Data is successfully saved!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));