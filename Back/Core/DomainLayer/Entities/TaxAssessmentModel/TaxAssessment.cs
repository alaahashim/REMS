using Core.DomainLayer.Entities.Common;
namespace Core.DomainLayer.Entities{
public class TaxAssessment :BaseEntity<int>
{
    // المعرفات الأساسية والأجنبية
    public int Id { get; set; }
    public int UnitId { get; set; }
    public int TaxYear { get; set; }

    // القيم المالية يفضل دائماً استخدام decimal لدقة الحسابات
    public decimal AnnualRent { get; set; }
    public decimal MaintenanceDiscountAmount { get; set; }
    public decimal NetTaxBase { get; set; }
    public decimal TaxRate { get; set; }
    public decimal AnnualTax { get; set; }

    // حقل منطقي (صح/خطأ)
    public bool IsExempted { get; set; }

    // التواريخ
    public DateTime CalculationDate { get; set; }

    // معرفات المستخدمين والموظفين المرتبطة
    public int CalculatedByUserId { get; set; }
    public int ApprovedByUserId { get; set; }
    public int EmployeeId { get; set; }
}}