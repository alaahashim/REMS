using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Exemption : BaseEntity<int>
    {
        public int OwnerId { get; set; }
        public Owner Owner { get; set; } = null!;

        public int UnitId { get; set; }
        public Unit Unit { get; set; } = null!;

        // رقم/كود الوحدة كما يظهر في طلب الإعفاء
        public string UnitNumber { get; set; } = null!;

        public string ExemptionType { get; set; } = null!;

        public DateTime ExemptionDate { get; set; }

        public WorkflowStatus Status { get; set; } = WorkflowStatus.Pending;

        // قرار المدير / اللجنة
        public string? DecisionResult { get; set; }

        public DateTime? ExemptionStartDate { get; set; }
        public DateTime? ExemptionEndDate { get; set; }

        public string? LegalReference { get; set; }
        public string? ExemptionReason { get; set; }
        public string? InspectionResult { get; set; }
        public string? Notes { get; set; }

        public ICollection<ExemptionAttachment> Attachments { get; set; } = new List<ExemptionAttachment>();
    }

    public enum WorkflowStatus
    {
        Pending = 1,   // قيد المراجعة
        Approved = 2,        // موافق عليه
        Rejected = 3,        // مرفوض
        NeedsMoreInfo = 4    // يحتاج استيفاء
    }
}