// src/services/adminService.js

// إضافة موظف جديد
export const addNewUser = (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const existingUsers = JSON.parse(localStorage.getItem('tax_users')) || [];
        const newUser = {
          id: Date.now(),
          ...userData,
          createdAt: new Date().toISOString()
        };
        existingUsers.push(newUser);
        localStorage.setItem('tax_users', JSON.stringify(existingUsers));
        
        resolve({ success: true, message: 'تم إضافة المستخدم بنجاح' });
      } catch (error) {
        reject({ success: false, message: 'حدث خطأ أثناء الحفظ' });
      }
    }, 1000);
  });
};

// جلب سجلات التدقيق (تم التعديل لإرجاع بيانات وهمية إذا كانت فارغة)
export const getSystemLogs = () => {
  return new Promise((resolve) => {
    let logs = JSON.parse(localStorage.getItem('tax_audit_logs')) || [];
    
    // إذا كانت فارغة، نرجع بيانات وهمية للعرض (Demo Data)
    if (logs.length === 0) {
        const dummyLogs = [
            { id: 101, date: new Date().toISOString(), user: 'System', employeeName: 'System', action: 'SYSTEM', entity: 'Server', details: 'تم تشغيل النظام بنجاح' },
            { id: 102, date: new Date().toISOString(), user: 'admin', employeeName: 'Administrator', action: 'LOGIN', entity: 'Auth', details: 'تسجيل دخول الأدمن' },
            { id: 103, date: new Date().toISOString(), user: 'System', employeeName: 'System', action: 'CHECK', entity: 'Properties', details: 'فحص سلامة قاعدة البيانات' },
            { id: 104, date: new Date().toISOString(), user: 'Manager', employeeName: 'Manager', action: 'APPROVE', entity: 'Property', details: 'اعتماد عقار رقم 554/21' },
            { id: 105, date: new Date().toISOString(), user: 'Finance', employeeName: 'Finance', action: 'PAYMENT', entity: 'Receipt', details: 'تسجيل إيصال رقم 992' }
        ];
        logs = dummyLogs;
    } else {
        // ترتيب الأحدث أولاً
        logs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setTimeout(() => resolve(logs), 500);
  });
};
