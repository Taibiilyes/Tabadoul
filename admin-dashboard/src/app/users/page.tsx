'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { api } from '../../lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [identifier, setIdentifier] = useState('');
  const [ip, setIp] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.listUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function banByIdentifier() {
    if (!identifier || !reason) return alert('أدخل المعرّف والسبب');
    await api.banByIdentifier(identifier, reason);
    setIdentifier('');
    setReason('');
    load();
  }

  async function banByIp() {
    if (!ip || !reason) return alert('أدخل عنوان IP والسبب');
    await api.banByIp(ip, reason);
    setIp('');
    setReason('');
    load();
  }

  async function unban(id: string) {
    await api.unbanUser(id);
    load();
  }

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>إدارة المستخدمين والحظر</h1>

        <div className="card">
          <h3>حظر بالهاتف / البريد الإلكتروني</h3>
          <input
            className="input"
            placeholder="رقم الهاتف أو البريد الإلكتروني"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input className="input" placeholder="سبب الحظر" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn btn-danger" onClick={banByIdentifier}>
            حظر هذا الحساب
          </button>
        </div>

        <div className="card">
          <h3>حظر بعنوان IP (يحظر كل الحسابات المرتبطة به)</h3>
          <input className="input" placeholder="عنوان IP" value={ip} onChange={(e) => setIp(e.target.value)} />
          <input className="input" placeholder="سبب الحظر" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button className="btn btn-danger" onClick={banByIp}>
            حظر كل حسابات هذا الـ IP
          </button>
        </div>

        <h2>كل المستخدمين ({users.length})</h2>
        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>المعرّف</th>
                <th>الجنس</th>
                <th>حالة التوثيق</th>
                <th>الرصيد</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.phoneNumber || u.email}</td>
                  <td>{u.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
                  <td>
                    <span className={`badge badge-${u.verificationStatus}`}>{u.verificationStatus}</span>
                  </td>
                  <td>{u.coinBalance} 🪙</td>
                  <td>
                    {u.isBanned ? <span className="badge badge-banned">محظور</span> : 'نشط'}
                  </td>
                  <td>
                    {u.isBanned && (
                      <button className="btn btn-secondary" onClick={() => unban(u.id)}>
                        إلغاء الحظر
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
