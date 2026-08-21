import React, { useState, useEffect } from 'react';

export default function MarketCalculator() {
    const [rates, setRates] = useState({ BTC: 64250, ETH: 3450, XRP: 0.58, SOL: 145 });
    const [calcAmount, setCalcAmount] = useState(1);
    const [fromCrypto, setFromCrypto] = useState('BTC');

    // Симулација на менување на цените во живо на секои 5 секунди
    useEffect(() => {
        const interval = setInterval(() => {
            setRates(prev => ({
                BTC: prev.BTC + (Math.random() * 40 - 20),
                ETH: prev.ETH + (Math.random() * 4 - 2),
                XRP: prev.XRP + (Math.random() * 0.002 - 0.001),
                SOL: prev.SOL + (Math.random() * 0.4 - 0.2)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.container}>
            {/* Live Market Table */}
            <div style={styles.card}>
                <h4 style={styles.title}>Live Cryptocurrency Market</h4>
                <div style={styles.marketRow}><span>Bitcoin (BTC)</span><strong style={{color: '#10b981'}}>${rates.BTC.toFixed(2)}</strong></div>
                <div style={styles.marketRow}><span>Ethereum (ETH)</span><strong style={{color: '#10b981'}}>${rates.ETH.toFixed(2)}</strong></div>
                <div style={styles.marketRow}><span>Ripple (XRP)</span><strong style={{color: '#10b981'}}>${rates.XRP.toFixed(4)}</strong></div>
                <div style={styles.marketRow}><span>Solana (SOL)</span><strong style={{color: '#10b981'}}>${rates.SOL.toFixed(2)}</strong></div>
            </div>

            {/* Crypto Calculator */}
            <div style={styles.card}>
                <h4 style={styles.title}>Crypto Converter Calculator</h4>
                <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                    <input
                        type="number"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(Number(e.target.value))}
                        style={styles.input}
                    />
                    <select value={fromCrypto} onChange={(e) => setFromCrypto(e.target.value)} style={styles.select}>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                        <option value="XRP">XRP</option>
                        <option value="SOL">SOL</option>
                    </select>
                </div>
                <div style={styles.resultBox}>
                    Estimated Value: <strong>${(calcAmount * rates[fromCrypto]).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</strong>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' },
    card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', border: '1px solid #334155' },
    title: { color: '#94a3b8', margin: '0 0 15px 0', fontSize: '16px' },
    marketRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155', color: '#fff', fontSize: '14px' },
    input: { flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' },
    select: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff' },
    resultBox: { padding: '12px', backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', textAlign: 'center', fontSize: '15px' }
};