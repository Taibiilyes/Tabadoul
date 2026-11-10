'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '../lib/api';

const links = [
  { href: '/', label: 'نظرة عامة' },
  { href: '/kyc', label: 'مراجعة التوثيق' },
  { href: '/users', label: 'المستخدمون والحظر' },
  { href: '/rooms', label: 'الغرف' },
  { href: '/audit-log', label: 'سجل التدقيق' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="nav">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? 'active' : ''}>
          {l.label}
        </Link>
      ))}
      <a
        style={{ marginRight: 'auto', cursor: 'pointer' }}
        onClick={() => {
          clearToken();
          router.push('/login');
        }}
      >
        تسجيل الخروج
      </a>
    </div>
  );
}
