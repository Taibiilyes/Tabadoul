'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { api } from '../../lib/api';

const typeLabels: Record<string, string> = {
  signup_bonus: 'مكافأة تسجيل',
  purchase: 'شراء عملات',
  call_cost: 'تكلفة مكالمة',
  room_creation: 'إنشاء غرفة',
  admin_adjustment: 'تعديل من المسير',
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAuditLog(300)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>سجل التدقيق الكامل</h1>
        <p style={{ color: '#9FB3D9' }}>
          هذا السجل غير قابل للتعديل أو الحذف — يعرض كل حركة عملات حصلت في التطبيق لكل المستخدمين، وهو المرجع
          الوحيد الموثوق لأي "تغيير أو تعديل" مالي.
        </p>
        {loading ? (
          <p>جارٍ التحميل...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>المستخدم</th>
                <th>النوع</th>
                <th>القيمة</th>
                <th>الرصيد بعدها</th>
                <th>ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleString('ar-DZ')}</td>
                  <td>{tx.user?.phoneNumber || tx.user?.email}</td>
                  <td>{typeLabels[tx.type] || tx.type}</td>
                  <td style={{ color: tx.amount >= 0 ? '#4CAF50' : '#E53935' }}>
                    {tx.amount >= 0 ? '+' : ''}
                    {tx.amount}
                  </td>
                  <td>{tx.balanceAfter}</td>
                  <td>{tx.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
