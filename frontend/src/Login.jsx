import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Unvallid data');
            }

            // Успешно ги запишуваме податоците во меморија
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('username', data.username || 'User');

            // ГО ПОВИКУВАМЕ ПРЕНАСОЧУВАЊЕТО (Поправка за твојата последна грешка)
            if (onLoginSuccess) {
                onLoginSuccess();
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={loginStyles.card}>
            <h3 style={loginStyles.title}>Sign In</h3>

            {error && <div style={loginStyles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} style={loginStyles.form}>
                <div style={loginStyles.group}>
                    <label style={loginStyles.label}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={loginStyles.input}
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <div style={loginStyles.group}>
                    <label style={loginStyles.label}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={loginStyles.input}
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button type="submit" disabled={loading} style={loginStyles.button}>
                    {loading ? 'Securing Session...' : 'Sign In to Wallet'}
                </button>
            </form>
        </div>
    );
}

// МОДЕРНИ СТИЛОВИ ЗА ЛОГИН КАРТИЧКАТА
const loginStyles = {
    card: { backgroundColor: '#1e293b', padding: '32px', borderRadius: '16px', border: '1px solid #334155', width: '100%', boxSizing: 'border-box', textAlign: 'left', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' },
    title: { color: '#ffffff', fontSize: '22px', margin: '0 0 20px 0', fontWeight: 'bold' },
    form: { display: 'flex', flexDirection: 'column', gap: '18px' },
    group: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { color: '#94a3b8', fontSize: '13px', fontWeight: '600' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', fontSize: '15px', outline: 'none' },
    button: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '8px', transition: 'background-color 0.2s' },
    errorAlert: { padding: '12px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }
};