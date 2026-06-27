using Core.DomainLayer.Entities;
using Core.DomainLayer.Entities.AdminModule;
using Core.DomainLayer.Entities.Common;

public class Payment : BaseEntity<int>
{
    public int InstallmentId { get; set; }

    public Installment Installment { get; set; } = null!;

    public decimal PaidAmount { get; set; }

    public DateTime PaymentDate { get; set; }

    // رقم الإيصال
    public string ReceiptNo { get; set; } = string.Empty;

    // Cash / Fawry / Bank / InstaPay
    public PaymentMethod Method { get; set; }

    // الموظف الذى سجل عملية الدفع
    public int? EmployeeId { get; set; }

    public Employee? Employee { get; set; }

    public string? Notes { get; set; }
}

public enum PaymentMethod
{
    Cash = 0,

    Fawry = 1,

    Bank = 2,

    InstaPay = 3
}