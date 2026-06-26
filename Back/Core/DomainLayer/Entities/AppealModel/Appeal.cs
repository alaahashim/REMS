using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Appeal : BaseEntity<int>
    {
        public int TaxAssessmentId { get; set; }
        public TaxAssessment TaxAssessment { get; set; } = null!;

        public DateTime AppealDate { get; set; }
        public string AppealReason { get; set; } = string.Empty;

        public AppealStatus Status { get; set; } = AppealStatus.Pending;

        // رسوم الطعن - تُسجل مرة واحدة عند الإنشاء
        public decimal FeeAmount { get; set; } = 50m;
        public bool IsFeePaid { get; set; } = true;

        public ICollection<AppealAttachment> Attachments { get; set; }
            = new HashSet<AppealAttachment>();
    }

    public enum AppealStatus
    {
        Pending = 1,
        UnderReview = 2,
        Accepted = 3,
        Rejected = 4
    }
}