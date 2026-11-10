'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { api } from '../../lib/api';

const PACKAGES = [100, 300, 500, 1000];

export default function WalletPage() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
    api.walletHistory().then(setHistory).catch(() => {});
  }, []);

  async function buy(coins: number) {
    const data = await api.purchaseCheckout(coins);
    // بعد ربط مزود دفع حقيقي: window.location.href = data.checkoutUrl
    console.log('Checkout session:', data);
  }

  return (
    <div>
      <Header balance={user?.coinBalance} />
      <div className="container" style={{ maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: '#9FB3D9' }}>رصيدك الحالي</p>
          <p style={{ fontSize: 42, color: '#FFD700', fontWeight: 700 }}>{user?.coinBalance ?? 0} 🪙</p>
        </div>

        <h3>شراء عملات ذهبية</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {PACKAGES.map((coins) => (
            <div key={coins} className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => buy(coins)}>
              <div style={{ color: '#FFD700', fontWeight: 700, fontSize: 18 }}>{coins} 🪙</div>
              <div style={{ color: '#9FB3D9' }}>{((coins / 100) * 3.99).toFixed(2)}$</div>
            </div>
          ))}
        </div>

        <h3>سجل الحركات</h3>
        <table>
          <tbody>
            {history.map((tx) => (
              <tr key={tx.id}>
                <td style={{ color: tx.amount >= 0 ? '#4CAF50' : '#E53935' }}>
                  {tx.amount >= 0 ? '+' : ''}
                  {tx.amount}
                </td>
                <td>{tx.note}</td>
                <td style={{ color: '#9FB3D9' }}>{new Date(tx.createdAt).toLocaleDateString('ar-DZ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
