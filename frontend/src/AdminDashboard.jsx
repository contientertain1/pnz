import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [activeTab, setActiveTab] = useState('list');
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [formData, setFormData] = useState({
        full_name: '', email: '', phone: '', password: '',
        status: 'Pending', role: 'user', balance: 0,
        telegram_agent: '', notes: '', address: '',
        bitcoin: '', ethereum: '', xrp: '', usdt: '', solana: '',
        activation_fee: 0, paid_amount: 0, bill_price: 100
    });

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || token === 'undefined') return;

            const res = await fetch(`${API_BASE}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                setUsers(data);
            } else {
                if (res.status === 401 || res.status === 403) {
                    localStorage.clear();
                    window.location.href = '/';
                }
                setMessage({ type: 'error', text: data.error || 'Unauthorized access' });
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined') {
            window.location.href = '/';
            return;
        }
        if (activeTab === 'list') {
            fetchUsers();
        }
    }, [activeTab]);

    const filteredUsers = users.filter(user =>
        (user.full_name && user.full_name.toLowerCase().includes(search.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSearch = (e) => { e.preventDefault(); };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleModalInputChange = (e) => {
        setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to create user');

            setMessage({ type: 'success', text: 'User created successfully!' });
            setFormData({
                full_name: '', email: '', phone: '', password: '',
                status: 'Pending', role: 'user', balance: 0,
                telegram_agent: '', notes: '', address: '',
                bitcoin: '', ethereum: '', xrp: '', usdt: '', solana: '',
                activation_fee: 0, paid_amount: 0, bill_price: 100
            });
            setActiveTab('list');
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(selectedUser)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Грешка при ажурирање');
            }

            alert("User updated successfully!");
            fetchUsers();
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            await fetch(`${API_BASE}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            fetchUsers();
            setIsModalOpen(false);
        }
    };

    return (
        <div style={styles.layout}>
            {/* ГЛАВЕН КОНТЕЈНЕР КОЈ ЦЕНТРИРА СЀ */}
            <div style={styles.contentWrapper}>

                {/* HEADER (РЕСПОНЗИВЕН) */}
                <div style={styles.header}>
                    <h1 style={styles.title}>Admin Dashboard</h1>
                    <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={styles.logoutBtn}>Logout</button>
                </div>

                {/* TABS (РЕСПОНЗИВНИ) */}
                <div style={styles.tabsContainer}>
                    <button onClick={() => setActiveTab('list')} style={activeTab === 'list' ? styles.activeTab : styles.tab}>
                        👥 Users List
                    </button>
                    <button onClick={() => setActiveTab('create')} style={activeTab === 'create' ? styles.activeTab : styles.tab}>
                        ⚙️ Create New User
                    </button>
                </div>

                {message.text && (
                    <div style={{...styles.alert, backgroundColor: message.type === 'success' ? '#064e3b' : '#7f1d1d', color: message.type === 'success' ? '#6ee7b7' : '#fca5a5'}}>
                        {message.text}
                    </div>
                )}

                {/* USERS LIST VIEW */}
                {activeTab === 'list' && (
                    <div>
                        {/* SEARCH BAR (РЕСПОНЗИВЕН) */}
                        <div style={styles.searchCard}>
                            <form onSubmit={handleSearch} style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                                <label style={styles.label}>Search Users</label>
                                <div style={styles.searchRow}>
                                    <input
                                        type="text"
                                        placeholder="Name or Email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={styles.searchInput}
                                    />
                                    <button type="submit" style={styles.searchBtn}>Search</button>
                                </div>
                            </form>
                        </div>

                        {/* USERS ROWS (РЕСПОНЗИВНИ) */}
                        <div style={styles.listContainer}>
                            {filteredUsers && filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <div key={user.id} style={styles.userRow}>
                                    <div style={styles.colMain}>
                                        <div style={styles.avatarIcon}>👤</div>
                                        <div>
                                            <div style={styles.userName}>{user.full_name}</div>
                                            <div style={styles.userEmail}>{user.email}</div>
                                        </div>
                                    </div>

                                   

                                    <div style={styles.col}>
                                        <div style={styles.normalText}>{user.role === 'admin' ? 'Administrator' : 'UserRegular'}</div>
                                    </div>

                                    <div style={styles.col}>
                                        <div style={styles.subTextLeftOnMobile}>STATUS</div>
                                        <div style={user.status === 'Active' ? styles.statusActive : styles.statusPending}>
                                            {user.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div style={styles.col}>
                                        <div style={styles.subTextLeftOnMobile}>BALANCE</div>
                                        <div style={styles.balanceText}>${user.balance?.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                    </div>

                                    <div style={styles.colAction}>
                                        <button onClick={() => openEditModal(user)} style={styles.settingsBtn}>⚙️ Edit</button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: '#1f2937'}}>
                                    No users found for "{search}".
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* CREATE NEW USER FORM (РЕСПОНЗИВНА) */}
                {activeTab === 'create' && (
                    <div style={styles.createCard}>
                        <h2 style={styles.cardTitle}>Create New User</h2>
                        <form onSubmit={handleCreateUser}>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name <span style={styles.asterisk}>*</span></label>
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required style={styles.input}/>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email <span style={styles.asterisk}>*</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={styles.input}/>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Password <span style={styles.asterisk}>*</span></label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required style={styles.input}/>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} style={styles.input}/>
                                </div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status <span style={styles.asterisk}>*</span></label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} style={styles.input}>
                                        <option value="Pending">Unverified / Pending</option>
                                        <option value="Active">Active</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>UserType <span style={styles.asterisk}>*</span></label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} style={styles.input}>
                                        <option value="user">UserRegular</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            {formData.role !== 'admin' && (
                                <>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Initial Amount ($) <span style={styles.asterisk}>*</span></label>
                                            <input type="number" name="balance" value={formData.balance} onChange={handleInputChange} style={styles.input}/>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Telegram Agent</label>
                                            <input type="text" name="telegram_agent" value={formData.telegram_agent} onChange={handleInputChange} style={styles.input}/>
                                        </div>
                                    </div>

                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Activation Fee ($)</label>
                                            <input type="number" name="activation_fee" value={formData.activation_fee} onChange={handleInputChange} style={styles.input}/>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Paid Amount ($)</label>
                                            <input type="number" name="paid_amount" value={formData.paid_amount} onChange={handleInputChange} style={styles.input}/>
                                        </div>
                                    </div>

                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Bill250 Price Per Unit ($)</label>
                                            <input type="number" name="bill_price" value={formData.bill_price} onChange={handleInputChange} style={styles.input}/>
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Address</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={styles.input}/>
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Note</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleInputChange} style={{...styles.input, height: '80px', resize: 'none'}}/>
                                    </div>
                                </>
                            )}

                            {formData.role === 'admin' && (
                                <div style={{marginTop: '20px', padding: '20px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #374151'}}>
                                    <h4 style={{color: '#7dd3fc', marginBottom: '15px', marginTop: 0}}>System Wallet Configuration</h4>
                                    <div style={styles.formGroup}><label style={styles.label}>Bitcoin (BTC)</label><input type="text" name="bitcoin" value={formData.bitcoin} onChange={handleInputChange} style={styles.input}/></div>
                                    <div style={styles.formGroup}><label style={styles.label}>Ethereum (ETH)</label><input type="text" name="ethereum" value={formData.ethereum} onChange={handleInputChange} style={styles.input}/></div>
                                    <div style={styles.formGroup}><label style={styles.label}>Solana (SOL)</label><input type="text" name="solana" value={formData.solana} onChange={handleInputChange} style={styles.input}/></div>
                                    <div style={styles.formGroup}><label style={styles.label}>Ripple (XRP)</label><input type="text" name="xrp" value={formData.xrp} onChange={handleInputChange} style={styles.input}/></div>
                                    <div style={styles.formGroup}><label style={styles.label}>Tether (USDT)</label><input type="text" name="usdt" value={formData.usdt} onChange={handleInputChange} style={styles.input}/></div>
                                </div>
                            )}

                            <button type="submit" style={styles.submitBtn}>Create User</button>
                        </form>
                    </div>
                )}
            </div>

            {/* EDIT USER MODAL (РЕСПОНЗИВЕН) */}
            {isModalOpen && selectedUser && (
                <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2>Edit User Profile</h2>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeModalX}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}><label style={styles.label}>Full Name <span style={styles.asterisk}>*</span></label><input type="text" name="full_name" value={selectedUser.full_name || ''} onChange={handleModalInputChange} required style={styles.input}/></div>
                                <div style={styles.formGroup}><label style={styles.label}>Email <span style={styles.asterisk}>*</span></label><input type="email" name="email" value={selectedUser.email || ''} onChange={handleModalInputChange} required style={styles.input}/></div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Password</label>
                                    <input type="text" name="password" value={selectedUser.password && selectedUser.password.startsWith('$2') ? '•••••• (Encrypted)' : selectedUser.password || ''} onChange={handleModalInputChange} onClick={() => { if (selectedUser.password && selectedUser.password.startsWith('$2')) { setSelectedUser({ ...selectedUser, password: '' }); } }} style={styles.input} placeholder="Type new password to override"/>
                                </div>
                                <div style={styles.formGroup}><label style={styles.label}>Phone Number</label><input type="text" name="phone" value={selectedUser.phone || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status <span style={styles.asterisk}>*</span></label>
                                    <select name="status" value={selectedUser.status || 'Pending'} onChange={handleModalInputChange} style={styles.input}>
                                        <option value="Pending">Unverified / Pending</option>
                                        <option value="Active">Active</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>UserType <span style={styles.asterisk}>*</span></label>
                                    <select name="role" value={selectedUser.role || 'user'} onChange={handleModalInputChange} style={styles.input}>
                                        <option value="user">UserRegular</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            {selectedUser.role !== 'admin' && (
                                <>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}><label style={styles.label}>Amount ($)</label><input type="number" name="balance" value={selectedUser.balance || 0} onChange={handleModalInputChange} style={styles.input}/></div>
                                        <div style={styles.formGroup}><label style={styles.label}>Telegram Agent</label><input type="text" name="telegram_agent" value={selectedUser.telegram_agent || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                    </div>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}><label style={styles.label}>Activation Fee ($)</label><input type="number" name="activation_fee" value={selectedUser.activation_fee || 0} onChange={handleModalInputChange} style={styles.input}/></div>
                                        <div style={styles.formGroup}><label style={styles.label}>Paid Amount ($)</label><input type="number" name="paid_amount" value={selectedUser.paid_amount || 0} onChange={handleModalInputChange} style={styles.input}/></div>
                                    </div>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}><label style={styles.label}>Bill250 Price ($)</label><input type="number" name="bill_price" value={selectedUser.bill_price || 100} onChange={handleModalInputChange} style={styles.input}/></div>
                                        <div style={styles.formGroup}><label style={styles.label}>Address</label><input type="text" name="address" value={selectedUser.address || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                    </div>
                                    <div style={styles.formGroup}><label style={styles.label}>Notes</label><textarea name="notes" value={selectedUser.notes || ''} onChange={handleModalInputChange} style={{...styles.input, height: '60px', resize: 'none'}}/></div>
                                </>
                            )}

                            {selectedUser.role === 'admin' && (
                                <div style={{marginTop: '10px', padding: '15px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #374151'}}>
                                    <h4 style={{color: '#7dd3fc', marginBottom: '10px', marginTop: 0}}>Wallet Config</h4>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}><label style={styles.label}>BTC</label><input type="text" name="bitcoin" value={selectedUser.bitcoin || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                        <div style={styles.formGroup}><label style={styles.label}>ETH</label><input type="text" name="ethereum" value={selectedUser.ethereum || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                    </div>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}><label style={styles.label}>SOL</label><input type="text" name="solana" value={selectedUser.solana || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                        <div style={styles.formGroup}><label style={styles.label}>XRP</label><input type="text" name="xrp" value={selectedUser.xrp || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                    </div>
                                    <div style={styles.formGroup}><label style={styles.label}>USDT</label><input type="text" name="usdt" value={selectedUser.usdt || ''} onChange={handleModalInputChange} style={styles.input}/></div>
                                </div>
                            )}

                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.saveChangesBtn}>Save</button>
                                <button type="button" onClick={() => handleDeleteUser(selectedUser.id)} style={styles.deleteUserBtn}>Delete</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    // ЦЕНТРИРАЊЕ И СВЕТСКИ РЕСПОНЗИВЕН LAYOUT
    layout: { minHeight: '100vh', backgroundColor: '#111827', padding: '20px', fontFamily: '"Inter", "Segoe UI", sans-serif', boxSizing: 'border-box', display: 'flex', justifyContent: 'center' },
    contentWrapper: { width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column' },

    // HEADER - Со flexWrap за мобилен
    header: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px' },
    title: { color: '#ffffff', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold', margin: 0 },
    logoutBtn: { padding: '8px 24px', backgroundColor: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' },

    tabsContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #374151', marginBottom: '30px' },
    tab: { padding: '12px 0', backgroundColor: 'transparent', color: '#9ca3af', border: 'none', borderBottom: '2px solid transparent', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    activeTab: { padding: '12px 0', backgroundColor: 'transparent', color: '#7dd3fc', border: 'none', borderBottom: '2px solid #7dd3fc', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },

    alert: { padding: '12px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', border: '1px solid currentColor' },

    // LIST VIEW
    searchCard: { backgroundColor: '#1f2937', padding: '25px', borderRadius: '8px', border: '1px solid #374151', marginBottom: '30px', display: 'flex', flexWrap: 'wrap' },
    searchRow: { display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' },
    searchInput: { flex: '1 1 200px', backgroundColor: '#111827', border: '1px solid #374151', color: '#fff', padding: '12px 16px', borderRadius: '6px', fontSize: '14px', outline: 'none' },
    searchBtn: { backgroundColor: '#7dd3fc', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', flex: '0 1 auto' },

    listContainer: { display: 'flex', flexDirection: 'column', backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' },
    // Респонзивен ред за корисници
    userRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: '20px', borderBottom: '1px solid #374151', gap: '20px' },
    colMain: { display: 'flex', alignItems: 'center', gap: '15px', flex: '1 1 250px' },
    avatarIcon: { width: '40px', height: '40px', border: '1px solid #3b82f6', borderRadius: '50%', color: '#7dd3fc', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '18px', flexShrink: 0 },
    userName: { color: '#fff', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' },
    userEmail: { color: '#9ca3af', fontSize: '12px', wordBreak: 'break-all' },

    col: { flex: '1 1 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    subText: { color: '#9ca3af', fontSize: '12px', marginBottom: '4px' },
    normalText: { color: '#d1d5db', fontSize: '14px' },
    subTextLeftOnMobile: { color: '#9ca3af', fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px' },

    statusActive: { color: '#10b981', fontWeight: '900', fontSize: '13px' },
    statusPending: { color: '#f59e0b', fontWeight: '900', fontSize: '13px' },
    balanceText: { color: '#10b981', fontWeight: 'bold', fontSize: '15px' },

    colAction: { flex: '1 1 100px', display: 'flex', justifyContent: 'flex-start' },
    settingsBtn: { background: 'none', border: '1px solid #4b5563', padding: '8px 12px', borderRadius: '6px', color: '#e5e7eb', fontSize: '14px', cursor: 'pointer', transition: '0.2s', fontWeight: 'bold' },

    // CREATE FORM VIEW
    createCard: { backgroundColor: '#1f2937', padding: '30px', borderRadius: '12px', border: '1px solid #374151', maxWidth: '800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' },
    cardTitle: { color: '#fff', margin: '0 0 25px 0', fontSize: '20px', fontWeight: 'bold' },
    // Респонзивни полиња
    formRow: { display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' },
    formGroup: { display: 'flex', flexDirection: 'column', flex: '1 1 250px' },

    label: { color: '#f9fafb', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' },
    asterisk: { color: '#f87171' },
    input: { backgroundColor: '#111827', border: '1px solid #374151', color: '#fff', padding: '12px', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
    submitBtn: { backgroundColor: '#7dd3fc', color: '#0f172a', width: '100%', padding: '14px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '16px', marginTop: '10px' },

    // EDIT MODAL (Респонзивен)
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: '#1f2937', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #374151', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', boxSizing: 'border-box' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #374151', paddingBottom: '15px', marginBottom: '20px', color: '#fff' },
    closeModalX: { backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '28px', cursor: 'pointer' },
    modalActions: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px', borderTop: '1px solid #374151', paddingTop: '20px' },
    saveChangesBtn: { flex: '1 1 auto', padding: '12px 20px', backgroundColor: '#7dd3fc', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' },
    deleteUserBtn: { flex: '1 1 auto', padding: '12px 20px', backgroundColor: 'transparent', color: '#fca5a5', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' },
    cancelBtn: { flex: '1 1 auto', padding: '12px 20px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }
};