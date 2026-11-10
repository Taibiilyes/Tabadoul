'use client';

import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { api } from '../../lib/api';

export default function KycPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<Record<string, { name: string; dob: string }>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await api.getPendingDocuments();
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    const f = formState[id];
    if (!f?.name || !f?.dob) {
      alert('يرجى إدخال الاسم الكامل وتاريخ الميلاد المستخرجين من الوثيقة قبل الموافقة');
      return;
    }
    try {
      await api.approveDocument(id, f.name, f.dob);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function reject(id: string) {
    const reason = prompt('سبب الرفض:');
    if (!reason) return;
    await api.rejectDocument(id, reason);
    load();
  }

  return (
    <div>
      <NavBar />
      <div className="container">
        <h1>مراجعة طلبات التوثيق ({docs.length})</h1>
        <p style={{ color: '#9FB3D9' }}>
          يُشترط تاريخ ميلاد يجعل عمر المستخدم 18 عامًا فأكثر — سيُرفض النظام تلقائيًا أي محاولة توثيق بعمر أقل.
        </p>

        {loading && <p>جارٍ التحميل...</p>}

        {docs.map((doc) => (
          <div key={doc.id} className="card">
            <p>
              <strong>نوع الوثيقة:</strong> {typeLabel(doc.type)} — <strong>المستخدم:</strong>{' '}
              {doc.user?.phoneNumber || doc.user?.email}
            </p>
            <p style={{ color: '#9FB3D9', fontSize: 14 }}>
              مسار الملف المشفّر: {doc.storageKey} (افتحه عبر رابط موقّع من لوحة التخزين السحابي)
            </p>

            <input
              className="input"
              placeholder="الاسم الكامل كما في الوثيقة"
              onChange={(e) =>
                setFormState((s) => ({ ...s, [doc.id]: { ...s[doc.id], name: e.target.value } }))
              }
            />
            <input
              className="input"
              type="date"
              onChange={(e) =>
                setFormState((s) => ({ ...s, [doc.id]: { ...s[doc.id], dob: e.target.value } }))
              }
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={() => approve(doc.id)}>
                موافقة وتوثيق
              </button>
              <button className="btn btn-danger" onClick={() => reject(doc.id)}>
                رفض
              </button>
            </div>
          </div>
        ))}

        {!loading && docs.length === 0 && <p>لا توجد طلبات توثيق بانتظار المراجعة حاليًا.</p>}
      </div>
    </div>
  );
}

function typeLabel(type: string) {
  return { national_id: 'بطاقة تعريف وطنية', passport: 'جواز سفر', live_selfie: 'صورة حية' }[type] || type;
}
