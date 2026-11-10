'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setToken } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!gender) return setError('يجب اختيار الجنس');
    if (!ageConfirmed) return setError('يجب تأكيد أنك بالغ 18 عامًا على الأقل');

    setLoading(true);
    try {
      const data = await api.register({
        [useEmail ? 'email' : 'phoneNumber']: identifier,
        password,
        gender,
        ageConfirmation: 'true',
      });
      setToken(data.token);
      router.push('/kyc');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="center-screen">
      <form onSubmit={handleSubmit} className="card" style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', color: '#FFD700' }}>إنشاء حساب</h2>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button type="button" className={useEmail ? 'btn btn-secondary' : 'btn'} onClick={() => setUseEmail(false)} style={{ flex: 1 }}>
            رقم الهاتف
          </button>
          <button type="button" className={!useEmail ? 'btn btn-secondary' : 'btn'} onClick={() => setUseEmail(true)} style={{ flex: 1 }}>
            البريد الإلكتروني
          </button>
        </div>

        <input
          className="input"
          placeholder={useEmail ? 'البريد الإلكتروني' : 'رقم الهاتف'}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <input className="input" type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button type="button" className={gender === 'male' ? 'btn' : 'btn btn-secondary'} onClick={() => setGender('male')} style={{ flex: 1 }}>
            ذكر
          </button>
          <button type="button" className={gender === 'female' ? 'btn' : 'btn btn-secondary'} onClick={() => setGender('female')} style={{ flex: 1 }}>
            أنثى
          </button>
        </div>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
          <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} />
          أؤكد أنني بالغ/ة 18 عامًا على الأقل
        </label>

        {error && <p style={{ color: '#E53935' }}>{error}</p>}

        <button className="btn" style={{ width: '100%' }} disabled={loading}>
          {loading ? '...' : 'تسجيل'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/login" style={{ color: '#9FB3D9' }}>
            لديك حساب بالفعل؟ سجّل الدخول
          </Link>
        </p>
      </form>
    </div>
  );
}
