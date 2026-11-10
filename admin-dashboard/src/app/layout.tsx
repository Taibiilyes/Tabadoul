import './globals.css';

export const metadata = {
  title: 'لوحة تحكم المسير — تبادل',
  description: 'لوحة تحكم إدارية خاصة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
