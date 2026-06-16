// src/utils/calculateTax.js

export const calculateTax = (input) => {
    const { annualRent, usage, isFirstHome } = input;

    // 1. تحديد نسبة الخصم بناءً على نوع الاستخدام (حسب طلبك)
    let discountRate = 0.30; // الافتراضي: سكني 30%
    
    // إذا كان غير سكني (تجاري أو صناعي)، الخصم يصبح 32%
    if (usage !== 'Residential') {
        discountRate = 0.32;
    }

    const discountAmount = annualRent * discountRate;
    const netRent = annualRent - discountAmount; // القيمة الصافية بعد الخصم

    // 2. نسبة الضريبة ثابتة 10% على القيمة الصافية
    const taxRate = 0.10;
    let tax = 0;
    let taxDetails = "";
    let exemptionAmount = 0;
    let taxableValue = netRent;

    // 3. منطق الإعفاءات
    // الإعفاءات عادة تنطبق على السكني (الوحدة الوحيدة)
    // التجاري عادة لا يخضع لإعفاءات شخصية (إلا حالات خاصة سنفترضها ليست موجودة هنا)
    
    if (usage === 'Residential' && isFirstHome) {
        // إعفاء للوحدة السكنية الأساسية
        tax = 0;
        taxDetails = `معفى (خصم ${discountRate * 100}% من إيجار وحدة سكنية أساسية)`;
        exemptionAmount = netRent * taxRate;
    } 
    else {
        // حالة السكني الإضافي أو التجاري/الصناعي
        tax = netRent * taxRate;
        taxDetails = usage === 'Residential' ? 'وحدة سكنية إضافية' : `وحدة ${usage} (خصم صيانة 32%)`;
        exemptionAmount = 0;
    }

    return {
        annualRent: annualRent,
        discountAmount: discountAmount,
        discountRate: discountRate * 100, // لإظهار النسبة في الـ UI
        netRent: netRent,
        taxRate: (taxRate * 100), // 10%
        taxDetails: taxDetails,
        exemptionAmount: exemptionAmount,
        taxableValue: taxableValue,
        tax: tax // الضريبة النهائية
    };
};