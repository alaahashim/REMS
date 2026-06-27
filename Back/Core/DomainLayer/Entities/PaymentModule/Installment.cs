using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Installment : BaseEntity<int>
    {
        public int TaxAssessmentId { get; set; }
        public TaxAssessment TaxAssessment { get; set; } = null!;

        public int InstallmentNumber { get; set; }

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public InstallmentStatus Status { get; set; } = InstallmentStatus.Pending;

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
    public enum InstallmentStatus
{
    Pending = 0,
    Paid = 1,
    Overdue = 2
}
}