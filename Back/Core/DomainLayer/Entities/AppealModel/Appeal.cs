using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Appeal : BaseEntity<int>
    {
        public int TaxAssessmentId { get; set; }
        public TaxAssessment TaxAssessment { get; set; } = null!;

        public DateTime AppealDate { get; set; }
        public string AppealReason { get; set; } = string.Empty;

        public AppealStatus Status { get; set; } = AppealStatus.PendingCommittee;

        // رسوم الطعن - تُسجل مرة واحدة عند الإنشاء
        public decimal FeeAmount { get; set; } = 50m;
        public bool IsFeePaid { get; set; } = true;


/// <summary>
/// committe
/// </summary>//


public string? CommitteeVerdict { get; set; }

public string? CommitteeNote { get; set; }

public DateTime? CommitteeDecisionDate { get; set; }

public int? CommitteeUserId { get; set; }

        public ICollection<AppealAttachment> Attachments { get; set; }
            = new HashSet<AppealAttachment>();
    }

    public enum AppealStatus
    {
        PendingCommittee = 1,

    PendingManager = 2,

    Approved = 3,

    Rejected = 4
    }
}