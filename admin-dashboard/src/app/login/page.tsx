'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const isEmail = identifier.includes('@');
      const data = await api.login(identifier, password, isEmail);
      if (data.user.role !== 'admin') {
        setError('هذا الحساب ليس حساب مسير. هذه اللوحة محصورة بالمسير فقط.');
        return;
      }
      setToken(data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleLogin} className="card" style={{ width: 360 }}>
        <h2 style={{ textAlign: 'center', color: '#FFD700' }}>دخول المسير</h2>
        <input
          className="input"
          placeholder="البريد الإلكتروني أو رقم الهاتف"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: '#E53935' }}>{error}</p>}
        <button className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? '...' : 'دخول'}
        </button>
      </form>
    </div>
  );
}
