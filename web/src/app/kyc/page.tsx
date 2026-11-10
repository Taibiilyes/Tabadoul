'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';

/**
 * ملاحظة: كما في نسخة الموبايل، الإنتاج الفعلي يتطلب رفع الصورة مباشرة
 * إلى تخزين سحابي مشفّر عبر رابط رفع موقّع (pre-signed URL)، وإرسال
 * storageKey فقط للخادم — وليس تمرير الملف نفسه عبر هذا الـ API كما هو
 * مبسّط هنا للتوضيح.
 */
export default function KycPage() {
  const router = useRouter();
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setError('يجب السماح بالوصول للكاميرا لإتمام التوثيق الحيوي');
    }
  }

  function captureSelfie() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setSelfieDataUrl(canvas.toDataURL('image/jpeg'));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  }

  async function submit() {
    if (!idFile || !selfieDataUrl) {
      setError('يرجى رفع صورة الهوية والتقاط الصورة الحية أولاً');
      return;
    }
    setUploading(true);
    setError('');
    try {
      // في تطبيق حقيقي: ارفع كل صورة لتخزين سحابي عبر signed URL أولاً
      await api.uploadDocument('national_id', `pending-upload-${Date.now()}-id`);
      await api.uploadDocument('live_selfie', `pending-upload-${Date.now()}-selfie`);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <h1 style={{ color: '#FFD700', textAlign: 'center' }}>توثيق الحساب</h1>
      <p style={{ color: '#9FB3D9', textAlign: 'center', marginBottom: 24 }}>
        هذه الخطوة إجبارية لإجراء المكالمات وإنشاء الغرف. المراجعة تتم يدويًا من طرف إدارة التطبيق فقط.
      </p>

      <div className="card">
        <h3>1. بطاقة التعريف الوطنية أو جواز السفر</h3>
        <input type="file" accept="image/*" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
        {idFile && <p style={{ color: '#4CAF50' }}>✓ تم اختيار: {idFile.name}</p>}
      </div>

      <div className="card">
        <h3>2. صورة حية (توثيق حيوي)</h3>
        {selfieDataUrl ? (
          <p style={{ color: '#4CAF50' }}>✓ تم التقاط الصورة الحية</p>
        ) : cameraOn ? (
          <div>
            <video ref={videoRef} autoPlay muted />
            <button className="btn" style={{ marginTop: 10 }} onClick={captureSelfie}>
              التقاط
            </button>
          </div>
        ) : (
          <button className="btn btn-secondary" onClick={openCamera}>
            فتح الكاميرا
          </button>
        )}
      </div>

      {error && <p style={{ color: '#E53935' }}>{error}</p>}

      <button className="btn" style={{ width: '100%' }} onClick={submit} disabled={uploading}>
        {uploading ? 'جارٍ الإرسال...' : 'إرسال للمراجعة'}
      </button>
    </div>
  );
}
