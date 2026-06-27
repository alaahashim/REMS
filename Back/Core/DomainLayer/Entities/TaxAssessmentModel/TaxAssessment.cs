using Core.DomainLayer.Entities.Common;
namespace Core.DomainLayer.Entities
{
    public class TaxAssessment : BaseEntity<int>
    {
        public int UnitId { get; set; }
        public Unit Unit { get; set; } = null!;

        // المالك الأساسي وقت التقدير
        public int? OwnerId { get; set; }
        public Owner? Owner { get; set; }

        public int TaxYear { get; set; }
public PaymentStatus PaymentStatus { get; set; }
        // القيمة الإيجارية السنوية
        public decimal AnnualRent { get; set; }
public decimal? ManagerApprovedTax { get; set; }
        // نسبة خصم الصيانة (0.30 أو 0.32)
        public decimal MaintenanceDiscountRate { get; set; }

        // قيمة خصم الصيانة
        public decimal MaintenanceDiscountAmount { get; set; }

        // صافي القيمة الإيجارية بعد الخصم
        public decimal NetAnnualRentalValue { get; set; }

        // نسبة الضريبة (مثلاً 0.10)
        public decimal TaxRate { get; set; }

        // الضريبة السنوية قبل الرسوم
        public decimal AnnualTax { get; set; }
        public decimal? CommitteeProposedTax { get; set; }

    /// <summary>
    /// الضريبة النهائية التي اعتمدها المدير
    /// </summary>
        // هل يوجد إعفاء؟
        public bool IsExempted { get; set; }

        // قيمة الإعفاء المطبق
        public decimal ExemptionAmount { get; set; }

        public string? ExemptionReason { get; set; }

        // من المسؤول عن الدفع؟ owner / tenant
        public PayerType PayerType { get; set; } = PayerType.Owner;

        // full / installment_2
        public PaymentPlan PaymentPlan { get; set; } =  PaymentPlan.Full;

        // رسوم إضافية (مثل رسوم طعن)
        public decimal AppealFee { get; set; }

        // الإجمالي النهائي = AnnualTax + AppealFee
        public decimal TotalDue { get; set; }

        public DateTime CalculationDate { get; set; } = DateTime.UtcNow;

        // Draft / Approved / Cancelled
        public TaxStatus Status { get; set; } = TaxStatus.Approved;

        public string? Notes { get; set; }
        public Appeal? Appeal { get; set; }
        public ICollection<Installment> Installments { get; set; }
    = new List<Installment>();
    }


public enum PaymentStatus
    {
        Pending = 0,

        PartiallyPaid = 1,

        Paid = 2,

        Overdue = 3
    }
}