'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { api } from '../lib/api';

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [roomsData, userData] = await Promise.all([api.listRooms(), api.me()]);
      setRooms(roomsData);
      setUser(userData);
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  async function createRoom() {
    if (!title.trim()) return;
    setError('');
    try {
      await api.createRoom(title);
      setShowModal(false);
      setTitle('');
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <Header balance={user?.coinBalance} />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1>الغرف النشطة</h1>
          <button className="btn" onClick={() => setShowModal(true)} style={{ whiteSpace: 'nowrap' }}>
            + غرفة جديدة (100 عملة)
          </button>
        </div>

        {user && user.verificationStatus !== 'verified' && (
          <div className="card" style={{ borderRight: '4px solid #FFA000' }}>
            حسابك غير موثّق بعد. <a href="/kyc" style={{ color: '#FFD700' }}>وثّق حسابك الآن</a> لتتمكن من إنشاء غرف وإجراء مكالمات.
          </div>
        )}

        {rooms.map((r) => (
          <div key={r.id} className="card room-card" onClick={() => router.push(`/rooms/${r.id}`)}>
            <div>
              <strong>{r.title}</strong>
              <p style={{ color: '#9FB3D9', margin: '4px 0 0' }}>
                بواسطة: {r.owner?.firstName || r.owner?.phoneNumber || r.owner?.email}
              </p>
            </div>
            <span>←</span>
          </div>
        ))}

        {rooms.length === 0 && <p style={{ color: '#9FB3D9' }}>لا توجد غرف نشطة حاليًا</p>}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 360 }}>
            <h3>إنشاء غرفة جديدة</h3>
            <input className="input" placeholder="عنوان الغرفة" value={title} onChange={(e) => setTitle(e.target.value)} />
            {error && <p style={{ color: '#E53935' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={createRoom} style={{ flex: 1 }}>
                إنشاء
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
