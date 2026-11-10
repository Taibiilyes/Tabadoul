import './globals.css';

export const metadata = {
  title: 'تبادل — دردشة ومكالمات',
  description: 'منصة دردشة نصية وصوتية ومرئية',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
