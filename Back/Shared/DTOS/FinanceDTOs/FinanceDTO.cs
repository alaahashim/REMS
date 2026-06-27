
using Core.DomainLayer.Entities; // لربط الـ Enums مثل PaymentStatus, PaymentPlan, PaymentMethod

namespace Shared.DTOS
{
    // 1) FinanceSearchResponseDto (النتيجة الشاملة للبحث مع طريقة الدفع)
    public class FinanceSearchResponseDto
    {
        public int AssessmentId { get; set; }

        public int UnitId { get; set; }

        public string OwnerName { get; set; } = string.Empty;

        public string NationalId { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public decimal AnnualTax { get; set; }

        public decimal TotalDue { get; set; }

        public PaymentPlan PaymentPlan { get; set; }

        public PaymentStatus  PaymentStatus { get; set; }

        public List<InstallmentDto> Installments { get; set; } = new();
    }

    // 2) InstallmentDto (تفاصيل الأقساط داخل نتيجة البحث)
    public class InstallmentDto
    {
        public int Id { get; set; }

        public int InstallmentNumber { get; set; }

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public InstallmentStatus Status { get; set; }
    }

    // 3) CreatePaymentDto (البيانات الكاملة المطلوبة لتنفيذ عملية الدفع)
    public class CreatePaymentDto
    {
        public int InstallmentId { get; set; }

        public decimal PaidAmount { get; set; }

        public string ReceiptNo { get; set; } = string.Empty;

        public PaymentMethod Method { get; set; }

        public DateTime PaymentDate { get; set; }

        public int EmployeeId { get; set; }

        public string? Notes { get; set; }
    }

    // 4) PaymentReceiptDto (بيانات الإيصال المرتجعة فوراً بعد نجاح الدفع للطباعة)
    public class PaymentReceiptDto
    {
        public string ReceiptNo { get; set; } = string.Empty;

        public int UnitId { get; set; }

        public string OwnerName { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public decimal PaidAmount { get; set; }

        public PaymentMethod Method { get; set; }

        public DateTime PaymentDate { get; set; }

        public int InstallmentNumber { get; set; }
    }

    // 5) PaymentHistoryDto (لعرض جدول آخر عمليات الدفع في الصفحة الرئيسية FinanceHome)
    public class PaymentHistoryDto
{
    public int PaymentId { get; set; }

    public int AssessmentId { get; set; }   // ← أضيفيه

    public int UnitId { get; set; }

    public string OwnerName { get; set; } = string.Empty;

    public decimal PaidAmount { get; set; }

    public PaymentMethod Method { get; set; }

    public string ReceiptNo { get; set; } = string.Empty;

    public DateTime PaymentDate { get; set; }

    public InstallmentStatus Status { get; set; }
}

    // 6) FinanceDashboardDto (إحصائيات لوحة التحكم المالية)
    public class FinanceDashboardDto
    {
        public int TotalAssessments { get; set; }

        public int PaidAssessments { get; set; }

        public int PendingAssessments { get; set; }

        public int OverdueInstallments { get; set; }

        public decimal TotalCollected { get; set; }

        public decimal RemainingAmount { get; set; }
    }

    // 7) FinanceSearchRequestDto (بارامتر البحث)
    public class FinanceSearchRequestDto
    {
        public string Search { get; set; } = string.Empty;
    }
}