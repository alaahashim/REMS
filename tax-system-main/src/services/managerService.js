// src/services/managerService.js

// دالة اعتماد قرار اللجنة (تحدث العقار فعلياً)
export const approveCommitteeAppeal = (appealId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const appeals = JSON.parse(localStorage.getItem('tax_appeals')) || [];
        const properties = JSON.parse(localStorage.getItem('tax_properties')) || [];
        
        const appealIndex = appeals.findIndex(a => String(a.id) === String(appealId));
        if (appealIndex === -1) return reject({ success: false, message: 'الطعن غير موجود' });

        const currentAppeal = appeals[appealIndex];
        
        // إيجاد العقار المرتبط
        const propIndex = properties.findIndex(p => p.currentPropertyNo === currentAppeal.unitId);
        
        if (propIndex !== -1) {
            // 1. تحديث حالة الطعن إلى "معتمد"
            appeals[appealIndex].status = 'Approved_By_Manager';
            
            // 2. تنفيذ القرار على العقار
            if (currentAppeal.verdict === 'Accept') {
                // إذا قبلت اللجنة: نطبق الضريبة الجديدة
                properties[propIndex].tax = currentAppeal.proposedTax;
                properties[propIndex].status = 'Approved'; // جاهز للمالية
                properties[propIndex].committeeDecisionDate = new Date().toISOString();
            } else {
                // إذا رفضت اللجنة: نترك الضريبة كما هي (حساب المراجع الأصلي) ونكمل المسار
                // إذا العقار كان Approved أصلاً نتركه كده، لو لا نخليه Approved عشان يروح المالية
                properties[propIndex].status = 'Approved'; 
            }
            
            localStorage.setItem('tax_appeals', JSON.stringify(appeals));
            localStorage.setItem('tax_properties', JSON.stringify(properties));
            resolve({ success: true, message: 'تم اعتماد القرار وتحديث سجل العقار' });
        } else {
            reject({ success: false, message: 'العقار غير موجود في النظام' });
        }

      } catch (error) {
        reject({ success: false, message: 'حدث خطأ في التحويل' });
      }
    }, 1000);
  });
};