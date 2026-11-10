'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearToken, getToken } from '../lib/api';

export default function Header({ balance }: { balance?: number }) {
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) router.replace('/login');
  }, [router]);

  return (
    <div className="header">
      <Link href="/" style={{ color: '#FFD700', fontWeight: 700, fontSize: 20, textDecoration: 'none' }}>
        تبادل
      </Link>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Link href="/wallet" style={{ textDecoration: 'none' }}>
          💰 {balance ?? '—'}
        </Link>
        <a
          style={{ cursor: 'pointer', color: '#9FB3D9' }}
          onClick={() => {
            clearToken();
            router.push('/login');
          }}
        >
          خروج
        </a>
      </div>
    </div>
  );
}
