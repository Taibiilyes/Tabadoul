# تطبيق الموبايل (Expo / React Native)

## 1. التشغيل الفوري على هاتفك أثناء التطوير (الأسهل)
```bash
npm install
npx expo start
```
سيظهر QR Code في الطرفية. ثبّت تطبيق **Expo Go** من متجر التطبيقات
(Google Play / App Store) على هاتفك، ثم امسح الكود ضوئيًا — سيفتح
تطبيقك مباشرة على هاتفك فورًا، ويتحدّث تلقائيًا كل مرة تعدّل فيها الكود.

⚠️ يجب تعديل `apiUrl` و `wsUrl` في `app.json` ليشيرا إلى عنوان خادمك
الفعلي (وليس `localhost`) حتى يعمل التطبيق من هاتفك الحقيقي.

## 2. إنتاج ملف APK حقيقي قابل للتثبيت المباشر (بدون Expo Go)
هذا يُنتج ملف `.apk` تُثبّته على أي هاتف أندرويد مباشرة، عبر خدمة
Expo السحابية المجانية (EAS Build) بدون الحاجة لتثبيت Android Studio:

```bash
npm install -g eas-cli
eas login          # أنشئ حساب مجاني على expo.dev إن لم يكن لديك
eas build:configure
eas build --platform android --profile preview
```
بعد انتهاء البناء (يستغرق عادة 10-20 دقيقة على خوادم Expo)، سيعطيك
رابط تحميل مباشر لملف APK — أرسله لهاتفك وثبّته مباشرة (فعّل "مصادر
غير معروفة" في إعدادات أندرويد أولاً).

## 3. لنشره على متجر Google Play / App Store لاحقًا
```bash
eas build --platform android --profile production   # ملف AAB لجوجل بلاي
eas build --platform ios --profile production        # يتطلب حساب Apple Developer
```

## ملاحظات تقنية مهمة قبل الإنتاج الفعلي
1. **رفع الوثائق**: شاشة `KycUploadScreen.tsx` حاليًا تستخدم قيمًا وهمية
   (`storageKey` placeholder). اربطها فعليًا برابط رفع موقّع من الخادم
   قبل الإطلاق (راجع ملاحظة الكود داخل الملف).
2. **الكاميرا في KYC**: `takePictureAsync()` غير مفعّلة فعليًا في الكود
   الحالي (مجرد mock)، يجب ربطها بـ `cameraRef` حقيقي.
3. **WebRTC**: `react-native-webrtc` يتطلب إعداد إضافي بسيط في مشروع
   Android/iOS الأصلي عند استخدام EAS Build (development build وليس
   Expo Go العادي، لأن Expo Go لا يدعم الوحدات الأصلية المخصصة).
   الحل: استخدم `eas build --profile development` لإنشاء نسخة تطوير
   مخصصة تدعم WebRTC، بدل الاعتماد فقط على Expo Go للمكالمات.
