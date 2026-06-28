using Core.DomainLayer.Entities;

namespace Shared.DTOS
{
    public class FinanceSearchResponseDto
    {
        public int AssessmentId { get; set; }
        public int UnitId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal AnnualTax { get; set; }
        public decimal AppealFee { get; set; }
        public decimal TotalDue { get; set; }
        public string PaymentPlan { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public bool IsAvailableForCollection { get; set; }
        public List<InstallmentDto> Installments { get; set; } = new();
    }

    public class InstallmentDto
    {
        public int Id { get; set; }
        public int InstallmentNumber { get; set; }
        public decimal Amount { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreatePaymentDto
    {
        public List<int> InstallmentIds { get; set; } = new();
        public string ReceiptNo { get; set; } = string.Empty;
        public PaymentMethod Method { get; set; }
        public DateTime PaymentDate { get; set; }
        public int EmployeeId { get; set; }
        public string? Notes { get; set; }
    }

    public class PaymentReceiptDto
    {
        public string ReceiptNo { get; set; } = string.Empty;
        public int UnitId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal TotalPaid { get; set; }
        public PaymentMethod Method { get; set; }
        public DateTime PaymentDate { get; set; }
        public List<int> InstallmentNumbers { get; set; } = new();
    }
public class PagedResult<T>
{
    public IEnumerable<T> Items     { get; set; } = [];
    public int TotalCount  { get; set; }
    public int PageIndex   { get; set; }
    public int PageSize    { get; set; }
    public int TotalPages  { get; set; }
}
    public class PaymentHistoryDto
    {
        public int PaymentId { get; set; }
        public int AssessmentId { get; set; }
        public int UnitId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public PaymentMethod Method { get; set; }
        public string ReceiptNo { get; set; } = string.Empty;
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
 public class EmployeePerformanceDto
{
    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public int TasksDone { get; set; }

    public int Score { get; set; }

    public bool IsActive { get; set; }
}
    public class FinanceDashboardDto
    {public int PendingInstallments { get; set; }
        public int TotalAssessments { get; set; }
        public int PaidAssessments { get; set; }
        public int PendingAssessments { get; set; }
        public int OverdueInstallments { get; set; }
        public decimal TotalCollected { get; set; }
        public decimal RemainingAmount { get; set; }
    }

    public class FinanceSearchRequestDto
    {
        public string Search { get; set; } = string.Empty;
    }
}