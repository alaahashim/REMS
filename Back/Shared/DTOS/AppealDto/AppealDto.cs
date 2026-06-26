using Core.DomainLayer.Entities;

namespace Shared.DTOS
{
    public class AppealListQueryDto
    {
        public string? Search { get; set; } // اسم مالك / رقم قومي / رقم وحدة
        public string? Status { get; set; } // Pending / UnderReview / Accepted / Rejected
        public int? TaxYear { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class AppealAssessmentSearchQueryDto
    {
        public string? Search { get; set; } // owner / national id / unit number
        public int? TaxYear { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    /// <summary>
    /// نتيجة البحث عن تقييمات ضريبية صالحة لإنشاء طعن
    /// </summary>
    public class AppealAssessmentLookupDto
    {
        public int TaxAssessmentId { get; set; }
        public int UnitId { get; set; }
        public string UnitNumber { get; set; } = string.Empty;
        public int TaxYear { get; set; }
        public string OwnerName { get; set; } = "-";
        public string? NationalId { get; set; }
        public decimal AnnualTax { get; set; }
        public decimal AppealFee { get; set; }
        public decimal TotalDue { get; set; }
        public bool HasAppeal { get; set; }
        public string PropertyAddress { get; set; } = "-";
    }

    public class AppealAttachmentDto
    {
        public int Id { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
    }

    public class AppealListItemDto
    {
        public int Id { get; set; }
        public int TaxAssessmentId { get; set; }
        public int UnitId { get; set; }
        public string UnitNumber { get; set; } = string.Empty;
        public string OwnerName { get; set; } = "-";
        public string? NationalId { get; set; }
        public int TaxYear { get; set; }
        public decimal AnnualTax { get; set; }
        public decimal AppealFee { get; set; }
        public decimal TotalDue { get; set; }
        public DateTime AppealDate { get; set; }
        public string AppealReason { get; set; } = string.Empty;
        public string Status { get; set; } = AppealStatus.PendingCommittee.ToString();
        public string PropertyAddress { get; set; } = "-";
    }

    public class AppealDetailsDto : AppealListItemDto
    {
        public List<AppealAttachmentDto> Attachments { get; set; } = new();
    }

    public class CreateAppealDto
    {
        public int TaxAssessmentId { get; set; }
        public DateTime AppealDate { get; set; }
        public string AppealReason { get; set; } = string.Empty;

        /// <summary>
        /// اختياري - لو أردت إضافة مرفقات من الواجهة لاحقاً
        /// </summary>
        public List<CreateAppealAttachmentDto> Attachments { get; set; } = new();
    }

    public class CreateAppealAttachmentDto
    {
        public string DocumentType { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
    }

    public class UpdateAppealDto
    {
        public DateTime AppealDate { get; set; }
        public string AppealReason { get; set; } = string.Empty;
        public AppealStatus? Status { get; set; } // لو أردتِ السماح بتغيير الحالة من شاشة الإدارة
        public List<CreateAppealAttachmentDto>? Attachments { get; set; }
    }

    public class DeleteAppealDto
    {
        /// <summary>
        /// افتراضيًا false = حذف الطعن فقط والإبقاء على الرسوم
        /// </summary>
        public bool RemoveAppealFee { get; set; } = false;
    }

    public class AppealCreateResultDto
    {
        public int AppealId { get; set; }
        public int TaxAssessmentId { get; set; }
        public decimal AppealFee { get; set; }
        public decimal TotalDue { get; set; }
        public string Message { get; set; } = "تم إنشاء الطعن بنجاح";
    }
}