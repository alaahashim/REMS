// ===========================
// 1. قاعدة البيانات الثابتة (Mock Static Data)
// ===========================
const STATIC_USERS_DB = {
  '11111111111111': { id: '11111111111111', name: 'أحمد علي', role: 'Data Entry' },
  '22222222222222': { id: '22222222222222', name: 'منى سعيد', role: 'Reviewer' },
  '33333333333333': { id: '33333333333333', name: 'كمال محمد', role: 'Finance' },
  '44444444444444': { id: '44444444444444', name: 'د. حسين', role: 'Manager' },
  '99999999999999': { id: '99999999999999', name: 'المدير العام', role: 'Admin' },
  '55555555555555': { id: '55555555555555', name: 'محمد القاضي', role: 'Committee Member' },
};

// ===========================
// 2. خدمة تسجيل الدخول (Login Service)
// ===========================
export const loginUser = (nationalId, password) => {
  return new Promise((resolve, reject) => {
    // محاكاة تأخير الشبكة (Network Latency)
    setTimeout(() => {
      
      // --- أ. التحقق من كلمة المرور ---
      // ملاحظة: في نظام حقيقي، كلمة المرور ستكون مشفرة داخل كل كائن مستخدم
      const DEFAULT_PASSWORD = '123';
      if (password !== DEFAULT_PASSWORD) {
        reject({ message: 'كلمة المرور خاطئة' });
        return;
      }

      // --- ب. دمج المستخدمين الثابتين مع المستخدمين الديناميكين ---
      // 1. جلب المستخدمين المضافين عبر لوحة التحكم (Admin Panel) من LocalStorage
      let dynamicUsers = {};
      try {
        dynamicUsers = JSON.parse(localStorage.getItem('users')) || {};
      } catch (e) {
        console.warn("Error reading localStorage:", e);
      }

      // 2. دمج القائمتين (المستخدمين في LocalStorage يغطون أي تطابق في Static DB)
      const allUsers = { ...STATIC_USERS_DB, ...dynamicUsers };

      // --- ج. البحث عن المستخدم ---
      const user = allUsers[nationalId];

      if (user) {
        resolve(user);
      } else {
        reject({ message: 'رقم قومي غير مسجل في النظام' });
      }

    }, 800); // تأخير 800 مللي ثانية
  });
};

// ===========================
// 3. دالة مساعدة للحصول على المستخدم (اختياري للاستخدام المستقبلي)
// ===========================
export const getUserById = (id) => {
  let dynamicUsers = JSON.parse(localStorage.getItem('users')) || {};
  const allUsers = { ...STATIC_USERS_DB, ...dynamicUsers };
  return allUsers[id];
};