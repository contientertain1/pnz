import React, { useState } from 'react';

const faqData = [
    { q: "What is the Q/X Mastercard?", a: "The Q/X Mastercard is a premium payment card that allows you to instantly spend your digital assets anywhere Mastercard is accepted worldwide. Your transactions are automatically processed at the point of purchase, completely skipping the tedious process of transferring funds to a traditional bank account." },
    { q: "How does the Q/X Mastercard work?", a: "When you swipe or dip your card, the system instantly bridges your linked digital balance to fiat currency in real time. The merchant receives payment in their local currency just like a regular card transaction, allowing you to utilize your funds fluidly without manual exchange delays." },
    { q: "When and how will I receive my physical card?", a: "Your physical card will be dispatched immediately following confirmation. It will arrive directly at your doorstep within 1 to 3 business days after your purchase, fully secure and ready for immediate activation." },
    { q: "Where can I use the Q/X Mastercard?", a: "You can use it at millions of locations globally—both online and in-store—wherever Mastercard is standard. This gives you the freedom to spend your balance whenever and wherever you want, just like any other traditional credit card." },
    { q: "Does the Q/X Card help avoid account fees?", a: "Yes. By routing your spending directly through the Q/X Card, you completely bypass the standard maintenance fees, receiving charges, and withdrawal penalties typically imposed by traditional state or legacy banking institutions." }
];

export default function Card({ profile, setCurrentView, setModalSend }) {
    const [activeIndex, setActiveIndex] = useState(null);

    return (
        <div style={styles.container}>
            <style>{`
                @media (max-width: 768px) {
                    .topLayout { grid-template-columns: 1fr !important; gap: 30px !important; }
                    .featuresGrid { grid-template-columns: 1fr !important; }
                }
                .card-hover { transition: transform 0.4s ease, box-shadow 0.4s ease; cursor: pointer; }
                .card-hover:hover { transform: scale(1.05); box-shadow: 0 30px 60px rgba(0,0,0,0.6) !important; }
            `}</style>

            <div className="topLayout" style={styles.topLayout}>
                <div style={styles.heroSection}>
                    <h1 style={styles.heroTitle}>Next-Gen Crypto Cards Built for <span style={{color: '#2563eb'}}>Quantum Q/X users</span></h1>
                    <p style={styles.heroText}>Experience the ultimate evolution of digital finance. Instantly convert your asset balance into real-world buying power at a moment's notice.</p>
                    <button
                        onClick={() => { setCurrentView('dashboard'); if(setModalSend) setModalSend(1); }}
                        style={styles.buyNowBtn}
                    >
                        Buy now
                    </button>
                </div>

                <div style={styles.cardWrapper}>
                    <div className="card-hover" style={styles.cardBackground}>
                        <div style={styles.chipContainer}>
                            {[...Array(9)].map((_, i) => <div key={i} style={styles.chipLine}></div>)}
                        </div>
                        <div style={styles.logo}>Q/X</div>
                        <div style={styles.cardNumber}>1234 5678 9012 3456</div>
                        <div style={styles.expiry}>12/26</div>
                        <div style={styles.cardName}>{profile?.full_name?.toUpperCase() || 'MINDY DOE'}</div>
                    </div>
                </div>
            </div>

            <div className="featuresGrid" style={styles.featuresGrid}>
                <div style={styles.featureBox}>
                    <div style={styles.icon}>$</div>
                    <h3 style={{margin: '10px 0', color: '#fff'}}>Spend your crypto freely</h3>
                    <p style={styles.featSub}>All cards are accepted at over 90 million online and offline stores</p>
                </div>
                <div style={styles.featureBox}>
                    <div style={styles.icon}>📱</div>
                    <h3 style={{margin: '10px 0', color: '#fff'}}>Manage on the go</h3>
                    <p style={styles.featSub}>Send crypto to your card securely through Quantum XRP Wallet</p>
                </div>
            </div>

            <div style={styles.faqSection}>
                <h3 style={{color: '#fff', marginBottom: '20px'}}>Frequently Asked Questions</h3>
                {faqData.map((item, index) => (
                    <div key={index} style={styles.accordionItem}>
                        <button style={styles.accordionHeader} onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
                            {item.q}
                            <span style={{transition: '0.3s', transform: activeIndex === index ? 'rotate(45deg)' : 'rotate(0deg)'}}>+</span>
                        </button>
                        <div style={{...styles.accordionContent, maxHeight: activeIndex === index ? '200px' : '0px', opacity: activeIndex === index ? 1 : 0}}>
                            <div style={{padding: '15px'}}>{item.a}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '40px 20px', color: '#fff', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' },
    topLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', marginBottom: '60px' },
    heroTitle: { fontSize: '42px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' },
    heroText: { color: '#9ca3af', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' },
    buyNowBtn: { padding: '14px 40px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
    cardWrapper: { perspective: '1000px' },
    cardBackground: { width: '100%', maxWidth: '500px', aspectRatio: '1.6 / 1', background: 'linear-gradient(135deg, #262626, #0a0a0a)', borderRadius: '16px', padding: '5%', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid #404040', margin: '0 auto' },
    chipContainer: { width: '15%', height: '20%', backgroundColor: '#d4af37', borderRadius: '4px', position: 'absolute', top: '5%', left: '5%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', padding: '1px' },
    chipLine: { backgroundColor: '#b8860b', borderRadius: '1px' },
    logo: { position: 'absolute', top: '5%', right: '5%', fontSize: 'clamp(16px, 6vw, 40px)', fontWeight: 'bold', color: '#a0a0a0' },
    cardNumber: { position: 'absolute', bottom: '30%', left: '5%', fontSize: 'clamp(12px, 4vw, 24px)', fontFamily: 'monospace', color: '#a0a0a0', letterSpacing: '2px' },
    expiry: { position: 'absolute', bottom: '15%', left: '5%', fontSize: 'clamp(10px, 2vw, 14px)', color: '#a0a0a0', fontFamily: 'monospace' },
    cardName: { position: 'absolute', bottom: '15%', right: '5%', fontSize: 'clamp(10px, 2.5vw, 20px)', fontWeight: '500', color: '#a0a0a0', textTransform: 'uppercase' },
    featuresGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '60px' },
    featureBox: { backgroundColor: '#0d0e12', padding: '40px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center' },
    icon: { fontSize: '32px', color: '#06b6d4' },
    featSub: { color: '#6b7280', fontSize: '14px', marginTop: '10px' },
    faqSection: { padding: '20px', borderTop: '1px solid #1f2937' },
    accordionItem: { marginBottom: '10px', border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden' },
    accordionHeader: { width: '100%', padding: '15px', background: '#0d0e12', border: 'none', color: '#fff', textAlign: 'left', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
    accordionContent: { color: '#94a3b8', fontSize: '14px', background: '#050505', transition: 'all 0.3s ease-in-out', overflow: 'hidden' }
};