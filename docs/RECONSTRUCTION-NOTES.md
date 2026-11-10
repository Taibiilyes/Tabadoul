# ملاحظات إعادة بناء المستودع

## ما تم استيراده

تمت إعادة إنشاء شجرة المشروع من ملف `tabadul-ALL-SOURCE.txt` المرفق:
٩٧ ملفًا موزّعة على `backend/` و`web/` و`admin-dashboard/` و`mobile/` و`desktop/`،
مع الاحتفاظ بملخص التسليم الأصلي في [`HANDOFF.md`](HANDOFF.md).

## تحسينات أُجريت أثناء التحقق

- استُبدلت الحزمة الأصلية `bcrypt` (التي تتطلب تحميل ملف ثنائي من GitHub أو بناءه
  محليًا) بحزمة `bcryptjs` النقية المكتوبة بـ JavaScript. توليد `$2b$` والتحقق منه
  يعملان، والت hashes القديمة المتوافقة مع bcrypt لا تزال قابلة للتحقق.
- أُضيف `esModuleInterop` إلى إعداد TypeScript في الخادم لضمان عمل الاستيراد
  الافتراضي لـ `helmet` و`bcryptjs` بعد البناء.
- رُفعت نسختا Next.js من `14.2.5` إلى `14.2.35` في `web/` و`admin-dashboard/`
  لمعالجة تحذير الأمان الذي أظهره npm.
- أُوقف `synchronize` افتراضيًا، وأُضيف مصدر بيانات مستقل للـ TypeORM CLI،
  وملف migration أولي ينشئ الجداول والقيود والفهارس، ويمنع UPDATE/DELETE على
  سجل المحفظة على مستوى قاعدة البيانات.
- صار `CORS_ORIGIN` إلزاميًا فعليًا في الإنتاج؛ إذا غاب تُرفض الطلبات عبر النطاقات
  المختلفة بدل السماح بكل النطاقات.
- أُضيف ملف `.gitignore` على مستوى المستودع وREADME جذري يشرح البنية والتشغيل،
  مع ملفات `package-lock.json` لكل حزمة Node لتثبيت قابل لإعادة التكرار.

## أوامر التحقق التي نجحت

```bash
(cd backend && npm install && npm run build)
(cd web && npm install && npm run build)
(cd admin-dashboard && npm install && npm run build)
(cd mobile && npm install && npx tsc --noEmit)
(cd desktop && npm install)
```

لم يُختبر تطبيق Tauri لأن أدوات Rust/system webview غير متاحة في بيئة البناء،
ولم يُبنَ APK لأن عملية EAS تتطلب حساب المطور واتصالًا بـ expo.dev.
