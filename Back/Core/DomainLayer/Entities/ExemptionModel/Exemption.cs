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

        public ExemptionStatus Status { get; set; } = ExemptionStatus.PendingCommittee;

        // قرار المدير / اللجنة
        public string? DecisionResult { get; set; }

        public DateTime? ExemptionStartDate { get; set; }
        public DateTime? ExemptionEndDate { get; set; }

        public string? LegalReference { get; set; }
        public string? ExemptionReason { get; set; }
        public string? InspectionResult { get; set; }
        public string? Notes { get; set; }
/////////////////////
public string? CommitteeVerdict { get; set; }

public string? CommitteeNote { get; set; }

public DateTime? CommitteeDecisionDate { get; set; }

public int? CommitteeUserId { get; set; }

///////////////////
  public ICollection<ExemptionAttachment> Attachments { get; set; } = new List<ExemptionAttachment>();
    }

   public enum ExemptionStatus
{
    PendingCommittee = 1,

    PendingManager = 2,

    Approved = 3,

    Rejected = 4
}
}