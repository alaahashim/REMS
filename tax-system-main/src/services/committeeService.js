// src/services/committeeService.js

// دالة اتخاذ قرار اللجان (محدثة)
export const committeeDecision = (appealId, decisionData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const appeals = JSON.parse(localStorage.getItem('tax_appeals')) || [];
        
        const appealIndex = appeals.findIndex(a => String(a.id) === String(appealId));
        if (appealIndex === -1) return reject({ success: false, message: 'الطعن غير موجود' });

        // تحديث الطعن فقط (وليس العقار بعد)
        appeals[appealIndex].status = 'Pending_Manager_Appeal'; // الحالة الجديدة بانتظار المدير
        appeals[appealIndex].verdict = decisionData.verdict; // 'Accept' or 'Reject'
        appeals[appealIndex].committeeNote = decisionData.note;
        appeals[appealIndex].reviewDate = new Date().toISOString();
        
        // إذا كان القبول، نحفظ المبلغ المقترح "مؤقتاً" في الطعن
        if (decisionData.verdict === 'Accept') {
            appeals[appealIndex].proposedTax = Number(decisionData.newTaxAmount);
        }

        localStorage.setItem('tax_appeals', JSON.stringify(appeals));
        resolve({ success: true, message: 'تم إحالة قرار اللجنة للمدير للموافقة النهائية' });

      } catch (error) {
        reject({ success: false, message: 'حدث خطأ أثناء الحفظ' });
      }
    }, 1000);
  });
};

export const getAppeals = () => {
  return new Promise((resolve) => {
    const data = JSON.parse(localStorage.getItem('tax_appeals')) || [];
    setTimeout(() => resolve(data), 500);
  });
};