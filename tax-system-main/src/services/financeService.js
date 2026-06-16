// src/services/financeService.js

// تسجيل دفع جديد (يربط بالقسط والوحدة)
export const registerPayment = (installmentId, paymentData) => {
  return new Promise((resolve, reject) => {
    try {
      // 1. تحديث القسط (Installment)
      const installments = JSON.parse(localStorage.getItem('tax_installments')) || [];
      const installmentIndex = installments.findIndex(i => i.id == installmentId);

      if (installmentIndex === -1) return reject({ message: 'القسط غير موجود' });

      // نحفظ بيانات القسط الحالي للاستخدام لاحقاً
      const currentInstallment = installments[installmentIndex];

      installments[installmentIndex].status = 'Paid';
      installments[installmentIndex].penaltyAmount = paymentData.penaltyAmount || 0;
      
      localStorage.setItem('tax_installments', JSON.stringify(installments));

      // 2. إنشاء سجل دفع (Payment Table) - وفقاً للـ ERD
      const payments = JSON.parse(localStorage.getItem('tax_payments')) || [];
      const newPayment = {
        id: Date.now(),
        installmentId: parseInt(installmentId),
        employeeId: paymentData.employeeId || 1, 
        paymentDate: paymentData.paymentDate || new Date().toISOString(),
        paidAmount: paymentData.amount,
        paymentMethod: paymentData.method,
        receiptNo: paymentData.receiptNo
      };

      payments.push(newPayment);
      localStorage.setItem('tax_payments', JSON.stringify(payments));

      // 3. التحقق هل جميع أقساط الوحدة تم دفعها؟ (تم تصحيح المنطق هنا)
      // نبحث عن جميع الأقساط التي تخص نفس الوحدة (UnitID)
      const allUnitInstallments = installments.filter(i => i.unitId == currentInstallment.unitId);
      const allPaid = allUnitInstallments.every(i => i.status === 'Paid');

      if (allPaid) {
          // تحديث حالة الوحدة إلى "Paid" في جدول الوحدات
          const units = JSON.parse(localStorage.getItem('tax_units')) || [];
          const unitIndex = units.findIndex(u => u.id == currentInstallment.unitId);
          if (unitIndex !== -1) {
              units[unitIndex].status = 'Paid';
              localStorage.setItem('tax_units', JSON.stringify(units));
          }
      }

      resolve({ success: true, message: 'تم تسجيل السداد بنجاح' });

    } catch (error) {
      reject({ success: false, message: 'فشلت العملية' });
    }
  });
};

// باقي الملف (getPaymentsHistory) كما هو بدون تغيير
export const getPaymentsHistory = () => {
  return new Promise((resolve) => {
    const data = JSON.parse(localStorage.getItem('tax_payments')) || [];
    const installments = JSON.parse(localStorage.getItem('tax_installments')) || [];
    const units = JSON.parse(localStorage.getItem('tax_units')) || [];

    const enriched = data.map(pay => {
      const inst = installments.find(i => i.id == pay.installmentId) || {};
      const unit = units.find(u => u.id == inst.unitId) || {};
      return {
        ...pay,
        unitId: unit.id,
        unitType: unit.unitType,
        dueDate: inst.dueDate
      };
    });

    setTimeout(() => resolve(enriched), 500);
  });
};
// دالة جلب إحصائيات مالية (للداشبورد)
export const getFinancialStats = () => {
  return new Promise((resolve) => {
    // جلب المدفوعات لمعرفة ما تم تحصيله
    const payments = JSON.parse(localStorage.getItem('tax_payments')) || [];
    
    // جلب الأقساط لمعرفة ما هو مستحق (لم يدفع بعد)
    const installments = JSON.parse(localStorage.getItem('tax_installments')) || [];
    
    let totalCollected = 0;
    let totalDue = 0;

    // 1. حساب الإجمالي المحصل من جدول المدفوعات (الأكثر دقة)
    payments.forEach(p => {
        totalCollected += Number(p.paidAmount || 0);
    });

    // 2. حساب الإجمالي المستحق من الأقساط التي حالتها "Pending"
    installments.forEach(inst => {
        if (inst.status === 'Pending') {
            totalDue += Number(inst.amount || 0);
        }
    });

    setTimeout(() => resolve({
        totalCollected,
        totalDue
    }), 500);
  });
};