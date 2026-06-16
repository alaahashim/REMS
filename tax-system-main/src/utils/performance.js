// دالة مساعدة لحساب أداء الموظفين
// (يمكنك وضعها في ملف utils/performance.js أو في ملف الخدمة)

export const getEmployeesPerformance = () => {
  const properties = JSON.parse(localStorage.getItem('tax_properties')) || [];
  const employees = [
    { id: 1, name: 'أحمد محمود', role: 'Reviewer' },
    { id: 2, name: 'سارة علي', role: 'Data Entry' },
    { id: 3, name: 'خالد إبراهيم', role: 'Finance' }
  ];

  // نتائج الأداء
  const performanceStats = employees.map(emp => {
    let score = 0;
    let tasksDone = 0;
    let totalErrors = 0; // الأخطاء أو الرفض

    // --- منطق حساب المراجع ---
    if (emp.role === 'Reviewer') {
      // 1. حساب عدد العمليات التي قام بها (حالة Approved هي النجاح)
      const approved = properties.filter(p => p.status === 'Approved' && p.reviewerId === emp.id).length;
      // 2. حساب العمليات التي رفضها المدير (خطأ)
      const rejected = properties.filter(p => p.status === 'Rejected' && p.reviewerId === emp.id).length;
      
      tasksDone = approved + rejected;
      
      // القانون: (الناجح / المجموع) * 100
      score = tasksDone > 0 ? Math.round((approved / tasksDone) * 100) : 0;
    } 
    
    // --- منطق حساب مدخل البيانات ---
    else if (emp.role === 'Data Entry') {
      // نفترض أن جميع العقارات تم إدخالها، والحالة Draft تعني أنه لم يتم رفضها
      const totalAdded = properties.filter(p => p.createdBy === emp.id).length;
      const rejected = properties.filter(p => p.status === 'Draft' && p.createdBy === emp.id).length; // Draft تعني أنه لم يمر بعد
      
      tasksDone = totalAdded;
      score = totalAdded > 0 ? 95 : 0; // مجرد مثال، مدخل البيانات دائماً حاصلة إلا إذا توقف عن العمل
    }

    // --- منطق حساب المالي ---
    else if (emp.role === 'Finance') {
      // عدد العقارات المدفوعة التي دفعها هذا الموظف
      const collected = properties.filter(p => p.status === 'Paid' && p.collectorId === emp.id).length;
      
      tasksDone = collected;
      // المالي يقيّم بكم المبلغ المحصل (في التقرير نعرض المبلغ)
      score = 90; // افتراضي
    }

    return {
      name: emp.name,
      role: emp.role,
      tasksDone,
      score: score, // النسبة المئوية للدقة
      totalCollected: emp.role === 'Finance' ? properties.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (p.tax||0), 0) : 0
    };
  });

  return performanceStats;
};