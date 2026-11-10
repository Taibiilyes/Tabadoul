# تبادل — Tabadoul

تطبيق دردشة نصية وصوتية ومرئية متعدد المنصات، مع تسجيل بالهاتف أو البريد،
توثيق هوية يراجعه المسير يدويًا، محفظة عملات داخلية ذات سجل محاسبي، غرف مدفوعة،
لوحة تحكم إدارية، وبريد دعم للشكاوى.

> حالة المستودع: هذه نسخة تطويرية قابلة للتشغيل محليًا. قبل أي إطلاق فعلي،
> راجع [ملخص التسليم](docs/HANDOFF.md) و[ملاحظات الإنتاج](backend/README.md)
> و[ملاحظات لوحة المسير](admin-dashboard/README.md).

## المكونات

| المجلد | التقنية | الوصف |
| --- | --- | --- |
| [`backend/`](backend/README.md) | NestJS 10, TypeORM, PostgreSQL, Socket.IO | API، JWT، KYC، wallet ledger، الغرف، الإدارة، البريد |
| [`web/`](web/) | Next.js 14 | واجهة المستخدم على الويب |
| [`admin-dashboard/`](admin-dashboard/README.md) | Next.js 14 | لوحة المسير فقط |
| [`mobile/`](mobile/README.md) | Expo / React Native | تطبيق الهاتف وبناء APK عبر EAS |
| [`desktop/`](desktop/README.md) | Tauri v2 | غلاف لسطح المكتب يعرض واجهة الويب |

## قواعد العمل

- ١٠ عملات عند التسجيل، و٢٥ عملة لكل ٦٠ ثانية مكالمة، ومكالمة مجانية واحدة بعد التوثيق.
- إنشاء غرفة يكلف ١٠٠ عملة.
- التسجيل والتوثيق للمستخدمين الذين تبلغ أعمارهم ١٨ عامًا أو أكثر فقط.
- مراجعة وثائق الهوية تتم يدويًا من المسير، ولا يوجد مسار API لترقية مستخدم إلى `admin`.
- كل حركة رصيد تُسجَّل في `wallet_transactions` ولا تُعدَّل السجلات القديمة.
- `POST /api/v1/support/complaint` محدد بثلاثة طلبات في الساعة لكل عنوان IP.

## التشغيل السريع

المتطلبات: Node.js 20+ وPostgreSQL 15+.

```bash
# 1. API
cd backend
npm install
cp .env.example .env       # عدّل كلمات المرور وJWT_SECRET
npm run migration:run      # أنشئ قاعدة tabadul أولًا في PostgreSQL
npm run start:dev           # http://localhost:3000/api/v1

# 2. واجهة الويب، من terminal آخر
cd web
npm install
cp .env.local.example .env.local
npm run dev                 # http://localhost:3000

# 3. لوحة المسير، من terminal ثالث (على منفذ مختلف)
cd admin-dashboard
npm install
cp .env.local.example .env.local
npm run dev -- -p 3001
```

للموبايل: راجع [`mobile/README.md`](mobile/README.md) وحدّد `apiUrl` و`wsUrl`
في `mobile/app.json`. بناء APK يحتاج تسجيل الدخول إلى Expo EAS من جهاز المطور.
النسخة المكتبية تحتاج تعديل عنوان الواجهة في
`desktop/src-tauri/tauri.conf.json` وتوفير أدوات Rust/Tauri محليًا.

## الأمان قبل الإنتاج

هذه العناصر **غير مكتملة عمدًا** ويجب ألا يُعتبر المشروع جاهزًا للإنتاج قبلها:

- ربط بوابة دفع مرخّصة والتحقق من توقيع webhook؛ `payment-provider.service.ts` حاليًا stub.
- استبدال `storageKey` الوهمي بروابط رفع/عرض موقّعة وتخزين مشفّر لوثائق KYC.
- 2FA إلزامي لحساب المسير، وتقييد CORS، وحماية لوحة الإدارة بشبكة خاصة أو IP allowlist.
- فحص المحتوى، وSFU للوسائط، ومطابقة الوجه عبر مزوّد مرخّص، ومراجعة قانونية لسياسات الدفع.
- تشغيل migrations بدل المزامنة التلقائية لقاعدة البيانات في الإنتاج.

راجع [`docs/HANDOFF.md`](docs/HANDOFF.md) لقائمة الحالة الكاملة وما تم اختباره سابقًا.
