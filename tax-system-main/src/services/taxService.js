// src/services/taxService.js

/**
 * دالة حساب الضريبة
 * تأخذ البيانات المدخلة وتعيد النتيجة
 */
export const calculateTax = ({ area, usage, locationZone = 'B', isFirstHome = false }) => {
  // تحويل القيمة لرقم
  const areaNum = parseFloat(area) || 0;

  // تحديد سعر المتر التقديري (مثال)
  let pricePerMeter = 30;
  if (usage === 'Commercial') pricePerMeter = 60;
  if (usage === 'Industrial') pricePerMeter = 40;

  // تعديل حسب المنطقة الضريبية
  const zoneMultiplier = locationZone === 'A' ? 1.15 : locationZone === 'C' ? 0.90 : 1;
  const zoneDescription = locationZone === 'A' ? 'منطقة A (سعر أعلى)' : locationZone === 'C' ? 'منطقة C (سعر مخفض)' : 'منطقة B (السعر القياسي)';

  // 1. القيمة الإيجارية السنوية التقديرية
  const annualRent = areaNum * pricePerMeter * 12 * zoneMultiplier;

  // 2. نسبة الخصم
  const discountRate = (usage === 'Residential') ? 0.30 : 0.32;
  const discountAmount = annualRent * discountRate;

  // 3. الوعاء الضريبي
  const taxBase = annualRent - discountAmount;

  // 4. الإعفاء الخاص بالوحدة الأساسية
  let exemptionAmount = 0;
  let exemptionLabel = '';
  if (usage === 'Residential' && isFirstHome) {
    exemptionAmount = taxBase;
    exemptionLabel = 'وحدة سكنية أساسية معفاة';
  }

  const netTax = Math.max(0, taxBase - exemptionAmount) * 0.10;

  return {
    annualRent,
    discountAmount,
    taxBase,
    netRent: taxBase,
    exemptionAmount,
    exemptionLabel,
    netTax,
    tax: netTax,
    pricePerMeter,
    zoneMultiplier,
    zoneDescription,
    discountRate: discountRate * 100,
    taxRate: 10
  };
};