// نقطة دخول تطبيق سطح المكتب: يعرض نافذة تحتوي واجهة الويب الخاصة
// بالتطبيق مباشرة (المُعرَّفة في tauri.conf.json)، مع إمكانية إضافة
// أوامر Rust مخصصة لاحقًا (مثل إشعارات النظام أو الوصول لملفات محلية)
// عبر tauri::generate_handler إن احتجت ذلك مستقبلًا.

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("خطأ أثناء تشغيل تطبيق تبادل لسطح المكتب");
}
