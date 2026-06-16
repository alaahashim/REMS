// src/services/installmentService.js

// توليد أقساط سنوية (قسطين في السنة مثلاً)
export const generateInstallments = (unitId, totalTax, year = new Date().getFullYear()) => {
  return new Promise((resolve) => {
    const installments = JSON.parse(localStorage.getItem('tax_installments')) || [];
    const installmentAmount = totalTax / 2; // تقسيم الضريبة على قسطين

    const newInstallments = [
      {
        id: Date.now(),
        unitId: unitId,
        dueDate: `${year}-06-30`, // القسط الأول (نهاية يونيو)
        amount: installmentAmount,
        penaltyAmount: 0,
        status: 'Pending' // Pending, Paid
      },
      {
        id: Date.now() + 1,
        unitId: unitId,
        dueDate: `${year}-12-31`, // القسط الثاني (نهاية ديسمبر)
        amount: installmentAmount,
        penaltyAmount: 0,
        status: 'Pending'
      }
    ];

    const updatedInstallments = [...installments, ...newInstallments];
    localStorage.setItem('tax_installments', JSON.stringify(updatedInstallments));
    resolve(newInstallments);
  });
};

// جلب الأقساط لوحدة معينة
export const getUnitInstallments = (unitId) => {
  return new Promise((resolve) => {
    const installments = JSON.parse(localStorage.getItem('tax_installments')) || [];
    const unitInstallments = installments.filter(i => i.unitId == unitId);
    resolve(unitInstallments);
  });
};