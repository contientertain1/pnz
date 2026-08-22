import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Bill250 from './Bill250';
import Card from './Card.jsx';
import { User, Settings, Receipt, CreditCard } from 'lucide-react';
if (typeof window !== 'undefined') {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#000000';
}



const responsiveCSS = `
    @media (max-width: 768px) {
        .rsp-layout { flex-direction: column !important; }
        .rsp-sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid #111827 !important; padding: 10px 0 !important; }
        .rsp-nav-menu { flex-direction: row !important; overflow-x: auto !important; gap: 0 !important; padding: 0 10px !important; }
        .rsp-nav-btn { padding: 10px 12px !important; font-size: 12px !important; border-left: none !important; border-bottom: 3px solid transparent !important; flex-shrink: 0 !important; }
        .rsp-nav-btn-active { border-left: none !important; border-bottom: 3px solid #2563eb !important; }
        .rsp-sidebar-profile { padding: 10px 15px 10px 15px !important; }
        .rsp-logout { margin-top: 0 !important; }
        .rsp-main { padding: 15px !important; }
        .rsp-payout-split { flex-direction: column !important; gap: 20px !important; }
        .rsp-payout-left { border-right: none !important; border-bottom: 1px solid #1f2937 !important; padding-right: 0 !important; padding-bottom: 20px !important; }
        .rsp-big-balance { font-size: 36px !important; }
        .rsp-holdings-table { font-size: 12px !important; }
        .rsp-holdings-table th, .rsp-holdings-table td { padding-right: 8px !important; }
        .rsp-market-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        .rsp-market-trend { display: none !important; }
        .rsp-modal { width: 90% !important; max-width: 360px !important; padding: 20px !important; }
    }
    @media (max-width: 480px) {
        .rsp-big-balance { font-size: 28px !important; }
        .rsp-holdings-table .rsp-hide-col { display: none !important; }
        .rsp-market-grid { grid-template-columns: 1fr 1fr !important; }
        .rsp-card { padding: 15px !important; }
        .rsp-send-receive { flex-direction: column !important; }
    }
`;

export default function UserDashboard() {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [currentView, setCurrentView] = useState('dashboard');
    const [profile, setProfile] = useState(null);
    const [adminAddresses, setAdminAddresses] = useState(null);

    const [modalSend, setModalSend] = useState(0);
    const [modalReceive, setModalReceive] = useState(0);
    const [selectedCoin, setSelectedCoin] = useState('bitcoin');

    const [recipientAddress, setRecipientAddress] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [receiveError, setReceiveError] = useState('');
    const [receiveSuccess, setReceiveSuccess] = useState('');

    const [settingsForm, setSettingsForm] = useState({ full_name: '', phone: '', address: '', currentPassword: '', newPassword: '' });
    const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });

    const [holdingsAsset, setHoldingsAsset] = useState('btc');

    const [marketData, setMarketData] = useState([
        { id: 'xrp', symbol: 'XRPUSDT', name: 'XRP', sub: 'Ripple', price: 1.14, change: 0.82, isUp: true, color: '#0ea5e9', icon: 'R' },
        { id: 'btc', symbol: 'BTCUSDT', name: 'BTC', sub: 'Bitcoin', price: 64000.00, change: 0.61, isUp: false, color: '#f59e0b', icon: 'B' },
        { id: 'eth', symbol: 'ETHUSDT', name: 'ETH', sub: 'Ethereum', price: 3400.00, change: 1.74, isUp: true, color: '#8b5cf6', icon: 'E' },
        { id: 'sol', symbol: 'SOLUSDT', name: 'SOL', sub: 'Solana', price: 140.00, change: 1.96, isUp: false, color: '#10b981', icon: 'S' },
        { id: 'usdt', symbol: 'USDT', name: 'USDT', sub: 'Tether', price: 1.00, change: 0.00, isUp: true, color: '#ec4899', icon: 'T' }
    ]);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');

            // 1. Ако нема токен, пренасочи го корисникот
            if (!token) {
                window.location.href = '/login';
                return;
            }

            // 2. Fetch со правилни хеддери
            const profRes = await fetch(`${API_BASE}/api/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Ова е клучниот дел
                    'Content-Type': 'application/json'
                }
            });

            // 3. ПРОВЕРКА пред .json()
            if (profRes.status === 403) {
                console.error("");
                localStorage.removeItem('token'); // Избриши го лошиот токен
                window.location.href = '/login';   // Принуди повторно логирање
                return;
            }

            if (!profRes.ok) {
                throw new Error(` ${profRes.status}`);
            }

            const profData = await profRes.json();
            setProfile(profData);

            // Поставување на settings формулар
            setSettingsForm({
                full_name: profData.full_name || '',
                phone: profData.phone || '',
                address: profData.address || '',
                currentPassword: '',
                newPassword: ''
            });

            // 4. Повик за адреси (исто со токен!)
            const addrRes = await fetch(`${API_BASE}/api/user/admin-addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (addrRes.ok) {
                const addrData = await addrRes.json();
                setAdminAddresses(addrData);
            }

        } catch (err) {
            console.error( err);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    useEffect(() => {
        const fetchLivePrices = async () => {
            try {
                const symbols = '["BTCUSDT","XRPUSDT","ETHUSDT","SOLUSDT"]';
                const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setMarketData(prev => prev.map(coin => {
                        if (coin.id === 'usdt') return coin;

                        const apiData = data.find(d => d.symbol === coin.symbol);
                        if (apiData) {
                            const currentPrice = parseFloat(apiData.lastPrice);
                            const percentChange = parseFloat(apiData.priceChangePercent);
                            return {
                                ...coin,
                                price: currentPrice,
                                change: Math.abs(percentChange).toFixed(2),
                                isUp: percentChange >= 0
                            };
                        }
                        return coin;
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch live market data", err);
            }
        };

        fetchLivePrices();
        const intervalId = setInterval(fetchLivePrices, 3000);
        return () => clearInterval(intervalId);
    }, []);

    if (!profile) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>Loading Quantum XRP...</div>;

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        setReceiveError('');
        setReceiveSuccess('');
        if (profile.status === 'Pending') {
            setReceiveError('⚠️ Activation Required! Your account is currently in "Pending" status. Payouts are locked until the activation fee is completed.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/user/send-crypto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ amount: parseFloat(sendAmount), recipientAddress })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Transaction failed.');
            setReceiveSuccess('Transaction successfully initiated.');
            fetchProfileData();
        } catch (err) {
            setReceiveError(err.message);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSettingsMsg({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(settingsForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile. Please check your current password.');

            // Хардкодирана англиска порака за успех
            setSettingsMsg({ type: 'success', text: 'Profile updated successfully!' });
            setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            fetchProfileData();
        } catch (err) {
            setSettingsMsg({ type: 'error', text: err.message });
        }
    };

    const userInitial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';

    const selectedHoldingCoin = marketData.find(c => c.id === holdingsAsset) || marketData[1];
    const holdingQuantity = profile.balance / selectedHoldingCoin.price;

    return (
        <>
            <style>{responsiveCSS}</style>
            <div className="rsp-layout" style={styles.layout}>
                {/* --- СТРАНИЧНО МЕНИ --- */}
                <div className="rsp-sidebar" style={styles.sidebar}>
                    <div className="rsp-sidebar-profile" style={styles.sidebarProfile}>
                        <div style={styles.avatar}>{userInitial}</div>
                        <div style={styles.profileName}>{profile.full_name || 'User'}</div>
                        <div style={styles.bellIcon}>🔔</div>
                    </div>

                    <div className="rsp-nav-menu" style={styles.navMenu}>
                        <button onClick={() => setCurrentView('dashboard')} className={`rsp-nav-btn${currentView === 'dashboard' ? ' rsp-nav-btn-active' : ''}`} style={{...styles.navBtn, color: '#94a3b8', backgroundColor: 'transparent', gap: '16px', padding: '14px 10px', borderRadius: '10px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '15px', fontWeight: '500', border: 'none'}}>
                            <span style={styles.navIcon}><User size={24} strokeWidth={1.8} fill="none" /></span> Dashboard
                        </button>
                        <button onClick={() => setCurrentView('settings')} className={`rsp-nav-btn${currentView === 'settings' ? ' rsp-nav-btn-active' : ''}`} style={{...styles.navBtn, color: currentView === 'settings' ? '#4ade80' : '#16a34a', backgroundColor: currentView === 'settings' ? 'rgba(74,222,128,0.08)' : 'transparent', gap: '16px', padding: '14px 10px', borderRadius: '10px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '15px', fontWeight: '500', border: 'none'}}>
                            <span style={styles.navIcon}><Settings size={24} strokeWidth={1.8} fill="none" /></span> User Settings
                        </button>
                        <button onClick={() => setCurrentView('bill250')} className={`rsp-nav-btn${currentView === 'bill250' ? ' rsp-nav-btn-active' : ''}`} style={{...styles.navBtn, color: currentView === 'bill250' ? '#fde047' : '#eab308', backgroundColor: currentView === 'bill250' ? 'rgba(253,224,71,0.08)' : 'transparent', gap: '16px', padding: '14px 10px', borderRadius: '10px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '15px', fontWeight: '500', border: 'none'}}>
                            <span style={styles.navIcon}><Receipt size={24} strokeWidth={1.8} fill="none" /></span> New Bill
                        </button>

                        <button
                            onClick={() => setCurrentView('card')}
                            className={`rsp-nav-btn${currentView === 'card' ? ' rsp-nav-btn-active' : ''}`}
                            style={{...styles.navBtn, color: currentView === 'card' ? '#60a5fa' : '#2563eb', backgroundColor: currentView === 'card' ? 'rgba(96,165,250,0.08)' : 'transparent', gap: '16px', padding: '14px 10px', borderRadius: '10px', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '15px', fontWeight: '500', border: 'none'}}
                        >
                            <span style={styles.navIcon}><CreditCard size={24} strokeWidth={1.8} fill="none" /></span> My Card
                        </button>

                        <a href={profile.telegram_agent ? `https://t.me/${profile.telegram_agent}` : '#'} target="_blank" rel="noreferrer" className="rsp-nav-btn" style={{...styles.navBtn, textDecoration: 'none'}}>
                            <span style={styles.navIcon}>❓</span> Need Help
                        </a>

                        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="rsp-nav-btn rsp-logout" style={styles.logoutBtn}>
                            <span style={styles.navIcon}>↪</span> Logout
                        </button>
                    </div>
                </div>

                {/* --- ГЛАВЕН ДЕЛ --- */}
                <div className="rsp-main" style={styles.mainContent}>
                    <div style={styles.contentWrapper}>

                        {profile.status === 'Pending' && (
                            <div style={styles.warningBanner}>
                                <span style={styles.warningIcon}>!</span> The network requires a one-time fee for account activation
                            </div>

                        )}

                        {currentView === 'dashboard' && (
                            <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>

                                <div className="rsp-card" style={styles.card}>
                                    <div className="rsp-payout-split" style={styles.payoutSplit}>
                                        <div className="rsp-payout-left" style={styles.payoutLeft}>
                                            <div style={styles.sectionLabel}>SCHEDULED PAYOUT</div>
                                            <h2 style={styles.notScheduled}>Not yet scheduled.</h2>
                                            <p style={styles.completeText}>Complete activation to receive a payout date.</p>
                                            <button onClick={() => setModalSend(1)} style={styles.activateBtn}>Activate</button>
                                        </div>
                                        <div style={styles.payoutRight}>
                                            <div style={styles.sectionLabel}>PAYOUT STEPS</div>
                                            <div style={styles.stepRow}><div style={styles.iconGreen}>✓</div> <span style={styles.textGreen}>Registration</span></div>
                                            <div style={styles.stepRow}><div style={styles.iconGreen}>✓</div> <span style={styles.textGreen}>Identity verification</span></div>
                                            <div style={styles.stepRow}>
                                                <div style={styles.iconOrange}>⏳</div>
                                                <div style={{display: 'flex', flexDirection: 'column'}}><span style={styles.textOrange}>Activation</span><span style={styles.subTextMuted}>Action required</span></div>
                                            </div>
                                            <div style={styles.stepRow}>
                                                <div style={styles.iconMuted}>🔒</div>
                                                <div style={{display: 'flex', flexDirection: 'column'}}><span style={styles.textMuted}>Payout</span><span style={styles.subTextMuted}>Complete activation first</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rsp-card" style={styles.card}>
                                    <div style={styles.balanceHeader}><span style={styles.walletIcon}>📄</span> TOTAL BALANCE</div>
                                    <h1 className="rsp-big-balance" style={styles.bigBalance}>${profile.balance?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h1>
                                    <div className="rsp-send-receive" style={styles.sendReceiveGroup}>
                                        <button onClick={() => setModalSend(1)} style={styles.actionBtn}>↗ Send</button>
                                        <button onClick={() => setModalReceive(1)} style={styles.actionBtn}>↙ Receive</button>
                                    </div>
                                </div>

                                <div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                                        <div style={styles.sectionLabel}>HOLDINGS BREAKDOWN</div>
                                    </div>
                                    <div className="rsp-card" style={{...styles.card, overflowX: 'auto'}}>
                                        <table className="rsp-holdings-table" style={styles.holdingsTable}>
                                            <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>ASSET SELECTION</th>
                                                <th style={styles.tableHeader}>HOLDINGS</th>
                                                <th className="rsp-hide-col" style={styles.tableHeader}>LIVE PRICE</th>
                                                <th style={styles.tableHeader}>USD VALUE</th>
                                                <th className="rsp-hide-col" style={styles.tableHeader}>ALLOCATION</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td style={styles.tableCell}>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                                        <div style={{...styles.btcIcon, backgroundColor: selectedHoldingCoin.color}}>{selectedHoldingCoin.icon}</div>
                                                        <select
                                                            value={holdingsAsset}
                                                            onChange={(e) => setHoldingsAsset(e.target.value)}
                                                            style={styles.assetSelect}
                                                        >
                                                            <option value="btc">BTC - Bitcoin</option>
                                                            <option value="xrp">XRP - Ripple</option>
                                                            <option value="eth">ETH - Ethereum</option>
                                                            <option value="sol">SOL - Solana</option>
                                                            <option value="usdt">USDT - Tether</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td style={{...styles.tableCell, color: '#fff', fontWeight: 'bold'}}>{holdingQuantity.toFixed(4)} {selectedHoldingCoin.name}</td>
                                                <td className="rsp-hide-col" style={{...styles.tableCell, color: '#fff'}}>${selectedHoldingCoin.price < 2 ? selectedHoldingCoin.price.toFixed(4) : selectedHoldingCoin.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                                <td style={{...styles.tableCell, color: '#fff', fontWeight: 'bold'}}>${profile.balance?.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                                                <td className="rsp-hide-col" style={styles.tableCell}>
                                                    <div style={{color: '#3b82f6', fontWeight: 'bold', textAlign: 'right', marginBottom: '5px'}}>100.00%</div>
                                                    <div style={{width: '100%', height: '2px', backgroundColor: '#3b82f6'}}></div>
                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '10px'}}>
                                        <div style={{color: '#fff', fontSize: '18px', fontWeight: 'bold'}}>Live Market Data</div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #1f2937', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#064e3b'}}>
                                            <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 5px #10b981'}}></div>
                                            <div style={{color: '#10b981', fontSize: '12px', fontWeight: 'bold'}}>LIVE UPDATES</div>
                                        </div>
                                    </div>

                                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                        <div className="rsp-market-grid" style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', padding: '0 20px', color: '#6b7280', fontSize: '12px', fontWeight: '700', letterSpacing: '1px'}}>
                                            <div>ASSET</div>
                                            <div>PRICE</div>
                                            <div>24H CHANGE</div>
                                            <div className="rsp-market-trend" style={{textAlign: 'right'}}>TREND</div>
                                        </div>

                                        {marketData.map((coin, idx) => (
                                            <div key={idx} className="rsp-card rsp-market-grid" style={{...styles.card, padding: '15px 25px', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', alignItems: 'center', transition: 'background-color 0.3s'}}>
                                                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                                                    <div style={{...styles.btcIcon, backgroundColor: coin.color}}>{coin.icon}</div>
                                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                                        <span style={{color: '#fff', fontWeight: 'bold'}}>{coin.name}</span>
                                                        <span style={{color: '#9ca3af', fontSize: '12px'}}>{coin.sub}</span>
                                                    </div>
                                                </div>
                                                <div style={{color: '#fff', fontWeight: 'bold', fontSize: '15px'}}>
                                                    ${coin.price < 2 ? coin.price.toFixed(4) : coin.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                                    <span style={{color: coin.isUp ? '#10b981' : '#ef4444', fontSize: '10px'}}>{coin.isUp ? '▲' : '▼'}</span>
                                                    <span style={{color: coin.isUp ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '14px'}}>{coin.change}%</span>
                                                </div>
                                                <div className="rsp-market-trend" style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                                                    <svg width="120" height="30" viewBox="0 0 120 30">
                                                        <path
                                                            d={coin.isUp ? "M0,25 C30,25 60,10 120,5" : "M0,5 C40,5 80,25 120,25"}
                                                            stroke={coin.color} strokeWidth="2" fill="none" strokeLinecap="round"
                                                        />
                                                        <path
                                                            d={coin.isUp ? "M0,25 C30,25 60,10 120,5 L120,30 L0,30 Z" : "M0,5 C40,5 80,25 120,25 L120,30 L0,30 Z"}
                                                            fill={`url(#grad${idx})`} opacity="0.15"
                                                        />
                                                        <defs>
                                                            <linearGradient id={`grad${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                                                <stop offset="0%" stopColor={coin.color} stopOpacity="1" />
                                                                <stop offset="100%" stopColor={coin.color} stopOpacity="0" />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        )}

                        {currentView === 'settings' && (
                            <div className="rsp-card" style={styles.card}>
                                <h3 style={{color: '#fff', marginBottom: '20px'}}>User Settings</h3>
                                {settingsMsg.text && <div style={{padding: '10px', backgroundColor: settingsMsg.type === 'error' ? '#7f1d1d' : '#064e3b', color: settingsMsg.type === 'error' ? '#fca5a5' : '#6ee7b7', borderRadius: '5px', marginBottom: '15px'}}>{settingsMsg.text}</div>}
                                <form onSubmit={handleUpdateProfile} style={{display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px'}}>
                                    <div><label style={styles.label}>Full Name</label><input type="text" value={settingsForm.full_name} onChange={(e) => setSettingsForm({...settingsForm, full_name: e.target.value})} style={styles.inputField}/></div>
                                    <div><label style={styles.label}>Phone Number</label><input type="text" value={settingsForm.phone} onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})} style={styles.inputField}/></div>
                                    <div><label style={styles.label}>Address</label><input type="text" value={settingsForm.address} onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})} style={styles.inputField}/></div>
                                    <hr style={{borderColor: '#1f2937', margin: '10px 0'}}/>
                                    <div><label style={styles.label}>Current Password</label><input type="password" value={settingsForm.currentPassword} onChange={(e) => setSettingsForm({...settingsForm, currentPassword: e.target.value})} style={styles.inputField} required/></div>
                                    <div><label style={styles.label}>New Password</label><input type="password" value={settingsForm.newPassword} onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})} style={styles.inputField}/></div>
                                    <button type="submit" style={styles.activateBtn}>Save Changes</button>
                                </form>
                            </div>
                        )}

                        {currentView === 'bill250' && (
                            <Bill250 profile={profile} onOrderComplete={() => { setCurrentView('dashboard'); setModalSend(1); }} />
                        )}

                        {currentView === 'card' && (
                            <div key="card-view" className="qx-card-view-wrapper" style={{width: '100%'}}>
                                <Card
                                    profile={profile}
                                    setCurrentView={setCurrentView}
                                    setModalSend={setModalSend}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* --- MODALS --- */}
                {modalSend === 1 && (
                    <div style={styles.modalOverlay}>
                        <div className="rsp-modal" style={styles.modalContent}>
                            <div style={styles.modalHeader}><h3 style={{margin:0}}>Send Crypto</h3><button onClick={() => setModalSend(0)} style={styles.closeX}>&times;</button></div>
                            <div style={{marginBottom: '25px'}}>
                                <label style={styles.label}>Select Crypto Asset Network</label>
                                <select value={selectedCoin} onChange={(e) => setSelectedCoin(e.target.value)} style={styles.inputField}>
                                    <option value="bitcoin">Bitcoin (BTC)</option>
                                    <option value="ethereum">Ethereum (ETH)</option>
                                    <option value="xrp">Ripple (XRP)</option>
                                    <option value="solana">Solana (SOL)</option>
                                    <option value="usdt">Tether (USDT)</option>
                                </select>
                            </div>
                            <button onClick={() => setModalSend(2)} style={{...styles.activateBtn, width: '100%'}}>Generate Secure Address</button>
                        </div>
                    </div>
                )}

                {modalSend === 2 && (
                    <div style={styles.modalOverlay}>
                        <div className="rsp-modal" style={styles.modalContent}>
                            <div style={styles.modalHeader}><h3 style={{margin:0}}>Generated Address</h3><button onClick={() => setModalSend(0)} style={styles.closeX}>&times;</button></div>
                            <p style={{color: '#9ca3af', fontSize: '13px', marginBottom: '15px'}}>Send only <strong style={{color: '#fff'}}>{selectedCoin.toUpperCase()}</strong> to this unique address.</p>

                            <div style={{padding: '12px', backgroundColor: '#000', borderRadius: '8px', color: '#3b82f6', textAlign: 'center', wordBreak: 'break-all', border: '1px solid #1f2937'}}>
                                {adminAddresses && adminAddresses[selectedCoin] ? adminAddresses[selectedCoin] : 'N/A'}
                            </div>

                            <div style={{textAlign: 'center', margin: '20px 0'}}>
                                <div style={{backgroundColor: '#fff', padding: '15px', display: 'inline-block', borderRadius: '10px'}}>
                                    {adminAddresses && adminAddresses[selectedCoin] ? (
                                        <QRCodeSVG value={adminAddresses[selectedCoin]} size={140} />
                                    ) : (
                                        <div style={{width: '140px', height: '140px', color: '#000', display:'flex', alignItems:'center', justifyContent:'center'}}>N/A</div>
                                    )}
                                </div>
                            </div>

                            {profile.activation_fee > 0 && (
                                <div style={{marginBottom: '20px', backgroundColor: '#000', padding: '15px', borderRadius: '8px', border: '1px solid #1f2937'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold'}}>
                                        <span style={{color: '#9ca3af'}}>Total Fee: <span style={{color: '#fff'}}>${profile.activation_fee}</span></span>
                                        <span style={{color: '#9ca3af'}}>Remaining: <span style={{color: '#ef4444'}}>${profile.activation_fee - (profile.paid_amount || 0)}</span></span>
                                    </div>
                                    <div style={{width: '100%', backgroundColor: '#1f2937', borderRadius: '5px', height: '8px', overflow: 'hidden'}}>
                                        <div style={{width: `${Math.min(((profile.paid_amount || 0) / profile.activation_fee) * 100, 100)}%`, backgroundColor: '#10b981', height: '100%'}}></div>
                                    </div>
                                </div>
                            )}

                            <div style={{display: 'flex', gap: '10px'}}>
                                <button onClick={() => { if(adminAddresses && adminAddresses[selectedCoin]) { navigator.clipboard.writeText(adminAddresses[selectedCoin]); alert('Copied!'); } }} style={{...styles.activateBtn, flex: 1}}>Copy</button>
                                <button onClick={() => setModalSend(1)} style={{...styles.navBtn, backgroundColor: '#1f2937', color: '#fff', padding: '10px 20px', borderRadius: '8px'}}>Back</button>
                            </div>
                        </div>
                    </div>
                )}

                {modalReceive === 1 && (
                    <div style={styles.modalOverlay}>
                        <div className="rsp-modal" style={styles.modalContent}>
                            <div style={styles.modalHeader}><h3 style={{margin:0}}>Withdraw Crypto</h3><button onClick={() => setModalReceive(0)} style={styles.closeX}>&times;</button></div>
                            {receiveError && <div style={{padding: '12px', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '8px', marginBottom: '15px', fontSize: '14px'}}>{receiveError}</div>}
                            {receiveSuccess && <div style={{padding: '12px', backgroundColor: '#064e3b', color: '#6ee7b7', borderRadius: '8px', marginBottom: '15px', fontSize: '14px'}}>{receiveSuccess}</div>}
                            {!receiveSuccess && (
                                <form onSubmit={handleWithdrawSubmit}>
                                    <div style={{marginBottom: '15px'}}>
                                        <label style={styles.label}>Target Address</label>
                                        <input type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} style={styles.inputField} required/>
                                    </div>
                                    <div style={{marginBottom: '20px'}}>
                                        <label style={styles.label}>Amount ($ USD)</label>
                                        <input type="number" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} style={styles.inputField} required/>
                                    </div>
                                    <button type="submit" style={{...styles.activateBtn, width: '100%'}}>Confirm Transfer</button>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

const styles = {
    layout: { display: 'flex', minHeight: '100vh', width: '100vw', fontFamily: '"Segoe UI", Roboto, sans-serif', backgroundColor: '#000000', margin: 0, padding: 0, overflowX: 'hidden' },

    sidebar: { width: '260px', backgroundColor: '#000000', borderRight: '1px solid #111827', display: 'flex', flexDirection: 'column', padding: '20px 0' },
    sidebarProfile: { display: 'flex', alignItems: 'center', padding: '0 20px 30px 20px', gap: '12px' },
    avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '14px' },
    profileName: { color: '#fff', fontWeight: '600', fontSize: '15px', flex: 1 },
    bellIcon: { color: '#f59e0b', cursor: 'pointer' },
    navMenu: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
    navBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: '0.2s', color: '#9ca3af' },
    navIcon: { fontSize: '16px' },
    logoutBtn: { display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#ef4444', marginTop: '10px' },

    mainContent: { flex: 1, padding: '30px 40px', overflowY: 'auto' },
    contentWrapper: { width: '100%', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },

    warningBanner: { backgroundColor: '#784615', color: '#fcd34d', padding: '14px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' },
    warningIcon: { backgroundColor: '#f59e0b', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', fontWeight: 'bold' },

    card: { backgroundColor: '#0d0e12', borderRadius: '12px', border: '1px solid #1f2937', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' },
    sectionLabel: { color: '#6b7280', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' },

    payoutSplit: { display: 'flex', gap: '40px' },
    payoutLeft: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderRight: '1px solid #1f2937', paddingRight: '40px' },
    notScheduled: { color: '#fff', margin: '5px 0', fontSize: '22px' },
    completeText: { color: '#f59e0b', fontSize: '13px', marginBottom: '20px' },
    activateBtn: { padding: '12px 30px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', transition: '0.2s' },

    payoutRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', paddingLeft: '10px' },
    stepRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    iconGreen: { width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #10b981', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' },
    textGreen: { color: '#10b981', fontSize: '14px', fontWeight: '600' },
    iconOrange: { width: '22px', height: '22px', color: '#f59e0b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '16px' },
    textOrange: { color: '#f59e0b', fontSize: '14px', fontWeight: '600' },
    iconMuted: { width: '22px', height: '22px', color: '#6b7280', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' },
    textMuted: { color: '#6b7280', fontSize: '14px', fontWeight: '600' },
    subTextMuted: { color: '#4b5563', fontSize: '11px' },

    balanceHeader: { color: '#9ca3af', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' },
    walletIcon: { fontSize: '14px' },
    bigBalance: { color: '#fff', fontSize: '56px', fontWeight: '700', margin: '15px 0 25px 0', letterSpacing: '-1px' },
    sendReceiveGroup: { display: 'flex', gap: '15px' },
    actionBtn: { flex: 1, padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },

    holdingsTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    tableHeader: { color: '#3b82f6', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', paddingBottom: '16px', borderBottom: '1px solid #1f2937' },
    tableCell: { paddingTop: '16px', paddingBottom: '8px' },

    btcIcon: { width: '28px', height: '28px', borderRadius: '50%', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
    assetSelect: { backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', padding: '6px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', outline: 'none', cursor: 'pointer' },

    label: { color: '#9ca3af', fontSize: '13px', fontWeight: '500', marginBottom: '8px', display: 'block' },
    inputField: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', backgroundColor: '#000', color: '#fff', boxSizing: 'border-box', outline: 'none' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
    modalContent: { backgroundColor: '#0d0e12', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '420px', border: '1px solid #1f2937' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '15px', marginBottom: '20px', color: '#fff' },
    closeX: { background: 'none', border: 'none', color: '#6b7280', fontSize: '24px', cursor: 'pointer' }
};
