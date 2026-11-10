'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isEmail = identifier.includes('@');
      const data = await api.login(identifier, password, isEmail);
      setToken(data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-screen">
      <form onSubmit={handleSubmit} className="card" style={{ width: 380 }}>
        <h2 style={{ textAlign: 'center', color: '#FFD700' }}>تسجيل الدخول</h2>
        <input className="input" placeholder="رقم الهاتف أو البريد الإلكتروني" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <input className="input" type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p style={{ color: '#E53935' }}>{error}</p>}
        <button className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? '...' : 'دخول'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/register" style={{ color: '#9FB3D9' }}>
            ليس لديك حساب؟ سجّل الآن
          </Link>
        </p>
      </form>
    </div>
  );
}
