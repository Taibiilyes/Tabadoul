# تبادل (Tabadul) — ملخص المشروع للمتابعة في محادثة جديدة

## الفكرة
تطبيق دردشة نصية/صوتية/مرئية (موبايل + ويب + سطح مكتب) مع تسجيل بالهاتف/الإيميل، توثيق هوية (بطاقة/جواز + صورة حية) يراجعه المسير يدويًا، عملات ذهبية داخلية، غرف مدفوعة، لوحة تحكم للمسير، وبريد دعم للشكاوى.

## المكونات (مجلد لكل واحد)
- backend/ — NestJS + PostgreSQL + Socket.io (JWT، KYC، wallet ledger، rooms، admin، mail)
- web/ — Next.js 14 (واجهة المستخدم)
- admin-dashboard/ — Next.js 14 (لوحة المسير فقط)
- mobile/ — Expo / React Native (+ eas.json لبناء APK)
- desktop/ — Tauri v2 (غلاف يعرض الويب؛ لم يُختبر البناء لعدم توفر Rust)

## قواعد العمل (مطبّقة)
- 10 عملات عند التسجيل، 25 عملة/60 ثانية مكالمة، مكالمة مجانية واحدة بعد التوثيق، 100 عملة لإنشاء غرفة
- السن 18+ (إقرار عند التسجيل + رفض تلقائي عند مراجعة الوثيقة)
- التوثيق يدويًا من المسير فقط؛ لا مسار API لترقية أحد إلى admin (تُضبط في قاعدة البيانات: UPDATE users SET role='admin' WHERE email='...')
- سجل محاسبي غير قابل للتعديل (wallet_transactions)
- POST /support/complaint للشكاوى (3/ساعة لكل IP)

## قرارات مهمة
- الشراء عبر بوابة دفع مرخّصة + webhook (payment-provider.service.ts هو stub يحتاج ربطًا حقيقيًا). تم رفض: محفظة شخصية تستلم المدفوعات مباشرة مع "لا استرداد أبدًا"، وإنشاء رصيد ضخم للمسير من العدم لبيعه مقابل USDT.
- رفع وثائق KYC حاليًا placeholder (storageKey وهمي) — يجب ربطه بروابط رفع موقّعة وتخزين مشفّر.

## ما اختُبر فعليًا (بيئة محلية: Postgres + backend + web + متصفح آلي)
تسجيل/دخول، KYC + رفض <18 + موافقة، غرف (ورفض نقص الرصيد)، دردشة WebSocket، خصم المكالمات، سجل التدقيق، الشكاوى، كل صفحات الويب.
أخطاء أُصلحت: JWT_SECRET لا يُقرأ قبل dotenv (dotenv.config() في أول main.ts)، rejectionReason لا يُمسح عند الموافقة، التفاف زر "غرفة جديدة".
ملاحظة: synchronize=true مفعّل في app.module.ts للاختبار فقط — أعده false واستخدم migrations.

## لم يُنجز / متبقٍ
1. بناء APK (يتطلب اتصالًا بـ expo.dev من جهاز المستخدم: eas login ثم eas build --platform android --profile preview)، وتعديل apiUrl/wsUrl في mobile/app.json لعنوان الخادم
2. أذونات GPS في الموبايل (الكاميرا/الميكروفون موجودة)
3. اختبار تطبيق الموبايل ولوحة المسير بنفس الاختبار الآلي
4. ربط بوابة دفع مرخّصة، رفع وثائق عبر signed URLs، فحص محتوى آلي، 2FA للمسير، SFU (LiveKit) للمكالمات، مطابقة الوجه عبر مزود مرخّص (Sumsub/Onfido)
5. WebRTC لا يعمل داخل Expo Go (يحتاج development build)
6. نسخة سطح المكتب: عدّل الرابط في desktop/src-tauri/tauri.conf.json، وشغّل npx tauri icon

## تشغيل محلي
backend: npm install; cp .env.example .env; npm run start:dev  (يحتاج PostgreSQL وقاعدة tabadul)
web/admin: npm install; ضبط NEXT_PUBLIC_API_URL; npm run dev
mobile: npm install; npx expo start
