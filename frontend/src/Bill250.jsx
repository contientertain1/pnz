import React, { useState } from 'react';

export default function Bill250({ profile, onOrderComplete }) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        city: '', state: '', zip: '', address: '', quantity: 1
    });

    const unitPrice = profile?.bill_price > 0 ? profile.bill_price : 100;
    const totalCost = (parseInt(formData.quantity) || 0) * unitPrice;

    const handleStep1Submit = (e) => { e.preventDefault(); setStep(2); };
    const handleStep2Submit = (e) => { e.preventDefault(); setStep(0); if (onOrderComplete) onOrderComplete(); };

    return (
        <div style={styles.container}>
            <style>{`
                @media (max-width: 900px) {
                    .heroLayout { grid-template-columns: 1fr !important; text-align: center; }
                    .infoGrid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <div className="heroLayout" style={styles.heroLayout}>
                <div style={styles.heroText}>
                    <h1 style={styles.mainTitle}>
                        Don't get left behind while everyone else <span style={{ color: '#2563eb' }}>secures a piece of history.</span>
                    </h1>
                    <p style={styles.subTitle}>Demand is massive, and printing queues are filling up by the second.</p>
                </div>
                <div style={styles.heroImage}>
                    <img src="/54b29e2b-8bfa-4ca7-bfc5-72a9a0f4b332.png" alt="Trump Bill" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }} />
                </div>
            </div>

            <div style={styles.videoContainer}>
                <video width="100%" height="100%" controls autoPlay muted loop style={{ objectFit: 'cover' }}>
                    <source src="/bill250.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="infoGrid" style={styles.infoGrid}>
                <div style={styles.infoBox}>
                    <h3 style={{color: '#fff', marginTop: 0}}>Qualified Access</h3>
                    <p>System protocols confirm you are in the top 5% of Americans eligible for this immediate financial routing. Because you are bypassing the traditional banking system and securing your cashout directly through Crypto—exactly the way Trump intended—you have unlocked an exclusive tier.</p>
                </div>
                <div style={styles.infoBox}>
                    <h3 style={{color: '#fff', marginTop: 0}}>The Liquidity Loophole</h3>
                    <p>This is a one-time, non-negotiable opportunity tied directly to your current crypto cashout. For the next few days only, the White House has authorized a limited release of the Official $250 Trump Bills for just $10 each.</p>
                </div>
            </div>


            <div className="infoGrid" style={styles.infoGrid}>
                <div style={styles.infoBox}>
                    <h3 style={{color: '#fff', marginTop: 0}}>Why This Matters To You Right Now:</h3>
                    <p>Why This Matters To You Right Now:
                        Basically Free Money: You are exchanging standard processing fees for hard, tangible assets backed by the movement.<br/>
                        <br/>

                        Direct From The Source: No middleman, no bank delays. Dispatched straight from printing oversight to your door.
                        <br/><br/>
                        Instant Crypto Validation: Your crypto cashout unlocked this specific rate. Once your transaction clears the blockchain, this door slams shut permanently.
                        <br/><br/>
                        ⚡️ CLAIM YOUR $250 BILLS FOR ONLY $10
                        Before the clock hits zero and your cashout protocol expires.</p>
                </div>
                <div style={styles.infoBox}>
                    <h3 style={{color: '#fff', marginTop: 0}}>The Liquidity Loophole</h3>
                    <p>This is a one-time, non-negotiable opportunity tied directly to your current crypto cashout. For the next few days only, the White House has authorized a limited release of the Official $250 Trump Bills for just $10 each.</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={() => setStep(1)} style={styles.blueOrderBtn}>📦 Order Now</button>
            </div>

            {/* --- МОДАЛИ --- */}
            {step === 1 && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>Step 1: Basic Info</h3>
                            <button onClick={() => setStep(0)} style={styles.closeX}>&times;</button>
                        </div>
                        <form onSubmit={handleStep1Submit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.inputField} />
                            </div>
                            <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                                <div style={{flex: 1}}><label style={styles.label}>Email</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.inputField} /></div>
                                <div style={{flex: 1}}><label style={styles.label}>Phone</label><input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={styles.inputField} /></div>
                            </div>
                            <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                                <div style={{flex: 1}}><label style={styles.label}>City</label><input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={styles.inputField} /></div>
                                <div style={{flex: 1}}><label style={styles.label}>State</label><input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} style={styles.inputField} /></div>
                            </div>
                            <button type="submit" style={styles.submitBtn}>Continue ➡️</button>
                        </form>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <h3>Step 2: Details & Payment</h3>
                            <button onClick={() => setStep(0)} style={styles.closeX}>&times;</button>
                        </div>
                        <form onSubmit={handleStep2Submit}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Address</label>
                                <input type="text" required placeholder="ex. Arlington PI 21" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={styles.inputField} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Quantity (1 Unit = ${unitPrice})</label>
                                <input type="number" required min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} style={styles.inputField} />
                            </div>
                            <div style={styles.calculatorBox}>
                                <span>Total:</span>
                                <span style={styles.calcTotal}>${totalCost.toLocaleString()}</span>
                            </div>
                            <button type="submit" style={styles.submitBtn}>Confirm Order ✅</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', color: '#cbd5e1' },
    heroLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', marginBottom: '40px' },
    mainTitle: { fontSize: '42px', fontWeight: 'bold', color: '#fff', lineHeight: '1.1', margin: 0 },
    subTitle: { fontSize: '18px', marginTop: '20px', color: '#94a3b8' },
    videoContainer: { width: '100%', height: '400px', background: '#000', borderRadius: '16px', marginBottom: '40px', overflow: 'hidden', border: '1px solid #1f2937' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' },
    infoBox: { backgroundColor: '#0d0e12', padding: '30px', borderRadius: '16px', border: '1px solid #1f2937' },
    blueOrderBtn: { padding: '14px 28px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px', transition: '0.2s' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(5px)' },
    modalContent: { backgroundColor: '#0d0e12', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px', border: '1px solid #2563eb' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#fff' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
    label: { color: '#6b7280', fontSize: '12px', marginBottom: '5px' },
    inputField: { padding: '12px', borderRadius: '8px', border: '1px solid #1f2937', backgroundColor: '#000', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' },
    calculatorBox: { backgroundColor: '#111827', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' },
    calcTotal: { color: '#10b981', fontSize: '24px', fontWeight: 'bold' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
    closeX: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }
};