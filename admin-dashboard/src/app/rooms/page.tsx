'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { api } from '../../lib/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setRooms(await api.listRooms());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function ban(id: string) {
    if (!confirm('هل أنت متأكد من حظر وإغلاق هذه الغرفة؟')) return;
    await api.banRoom(id);
    load();
  }

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>الغرف النشطة ({rooms.length})</h1>
        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : (
          rooms.map((r) => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{r.title}</strong>
                <p style={{ color: '#9FB3D9', margin: '4px 0 0' }}>
                  المالك: {r.owner?.phoneNumber || r.owner?.email}
                </p>
              </div>
              <button className="btn btn-danger" onClick={() => ban(r.id)}>
                حظر الغرفة
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
