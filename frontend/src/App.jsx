import React, { useState } from 'react';
import UserDashboard from './UserDashboard';
import Login from './Login';

// ДОДАЈ ЈА ОВАА ЛИНИЈА ТУКА ЗА ДА СЕ ВКЛУЧИ АДМИН ПАНЕЛОТ:
import AdminDashboard from './AdminDashboard';

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
    const [username, setUsername] = useState(localStorage.getItem('username') || 'User');

    // Оваа функција се активира инстантно кога логинот ќе успее
    const handleLoginSuccess = () => {
        setToken(localStorage.getItem('token'));
        setUserRole(localStorage.getItem('userRole'));
        setUsername(localStorage.getItem('username') || 'User');
    };

    const handleLogout = () => {
        localStorage.clear();
        setToken(null);
        setUserRole(null);
    };

    // Ако нема токен, ја прикажуваме формата и ја врзуваме со handleLoginSuccess
    if (!token) {
        return (
            <div style={styles.loginWrapper}>
                <div style={{ color: '#fff', textAlign: 'center', fontFamily: 'sans-serif', width: '100%', maxWidth: '400px', padding: '20px' }}>
                    <h2 style={{ marginBottom: '10px', fontSize: '28px' }}>Welcome to CryptoWallet</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Please log in to manage your assets.</p>

                    {/* Точно пренесена функција */}
                    <Login onLoginSuccess={handleLoginSuccess} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.appWrapper}>


            {/* ГЛАВЕН ДЕЛ КАДЕ ШТО СЕ ПРИКАЖУВА DASHBOARD-ОТ */}
            {/* ГЛАВЕН ДЕЛ КАДЕ ШТО СЕ ПРИКАЖУВА DASHBOARD-ОТ */}
            <div style={styles.contentArea}>
                {userRole && userRole.toLowerCase() === 'admin' ? (

                    // ГО ВРАЌАМЕ ЦЕЛИОТ АДМИНСКИ ПАНЕЛ ТУКА:
                    <AdminDashboard />

                ) : (
                    <UserDashboard />
                )}
            </div>
        </div>
    );
}

const styles = {
    appWrapper: { backgroundColor: '#0f172a', minHeight: '100vh', width: '100%', margin: 0, padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'stretch', overflowX: 'hidden' },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', boxSizing: 'border-box', width: '100%' },
    userInfo: { color: '#94a3b8', fontFamily: '"Segoe UI", Roboto, sans-serif', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
    statusDot: { color: '#10b981', fontSize: '12px' },
    logoutBtn: { padding: '8px 16px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontFamily: '"Segoe UI", Roboto, sans-serif', fontSize: '13px', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)' },
    contentArea: { flex: 1, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'row', alignItems: 'stretch' },
    loginWrapper: { backgroundColor: '#0f172a', minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 0, padding: 0 }
};