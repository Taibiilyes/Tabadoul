'use client';

import { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import { api } from '../lib/api';

export default function OverviewPage() {
  const [stats, setStats] = useState({ users: 0, pendingKyc: 0, rooms: 0, banned: 0 });

  useEffect(() => {
    Promise.all([api.listUsers(), api.getPendingDocuments(), api.listRooms()])
      .then(([users, pending, rooms]) => {
        setStats({
          users: users.length,
          pendingKyc: pending.length,
          rooms: rooms.length,
          banned: users.filter((u: any) => u.isBanned).length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>نظرة عامة</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <StatCard label="إجمالي المستخدمين" value={stats.users} />
          <StatCard label="طلبات توثيق بانتظار المراجعة" value={stats.pendingKyc} highlight={stats.pendingKyc > 0} />
          <StatCard label="الغرف النشطة" value={stats.rooms} />
          <StatCard label="حسابات محظورة" value={stats.banned} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="card" style={{ textAlign: 'center', border: highlight ? '1px solid #FFD700' : 'none' }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#FFD700' }}>{value}</div>
      <div style={{ color: '#9FB3D9', marginTop: 6 }}>{label}</div>
    </div>
  );
}
