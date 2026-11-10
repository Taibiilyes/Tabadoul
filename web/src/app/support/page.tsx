'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export default function SupportPage() {
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/support/complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromEmail, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'حدث خطأ');
      setStatus('sent');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="center-screen">
        <div className="card" style={{ width: 400, textAlign: 'center' }}>
          <h2 style={{ color: '#4CAF50' }}>تم استلام شكواك</h2>
          <p style={{ color: '#9FB3D9' }}>سنتواصل معك عبر بريدك الإلكتروني قريبًا.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="center-screen">
      <form onSubmit={submit} className="card" style={{ width: 420 }}>
        <h2 style={{ textAlign: 'center', color: '#FFD700' }}>شكوى أو اقتراح</h2>
        <input
          className="input"
          type="email"
          placeholder="بريدك الإلكتروني للرد عليك"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          required
        />
        <input className="input" placeholder="الموضوع" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <textarea
          className="input"
          rows={5}
          placeholder="تفاصيل الشكوى أو الاقتراح"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        {error && <p style={{ color: '#E53935' }}>{error}</p>}
        <button className="btn" style={{ width: '100%' }} disabled={status === 'sending'}>
          {status === 'sending' ? 'جارٍ الإرسال...' : 'إرسال'}
        </button>
      </form>
    </div>
  );
}
