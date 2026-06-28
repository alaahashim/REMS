namespace Shared.DTOS
{
    public class CreateExemptionDto
    {
        public int OwnerId { get; set; }
        public int UnitId { get; set; }
        public string UnitNumber { get; set; } = null!;

        public string ExemptionType { get; set; } = null!;
        public DateTime ExemptionDate { get; set; }

        public DateTime? ExemptionStartDate { get; set; }
        public DateTime? ExemptionEndDate { get; set; }

        public string? LegalReference { get; set; }
        public string? ExemptionReason { get; set; }
        public string? InspectionResult { get; set; }
        public string? Notes { get; set; }
    }

    // DTO خفيف لعرض القوائم - GET /api/exemptions
    public class ExemptionDto
    {
        public int Id { get; set; }

        public string OwnerName { get; set; } = null!;
        public string NationalId { get; set; } = null!;

        public string UnitNumber { get; set; } = null!;
        public string ExemptionType { get; set; } = null!;

        public string Status { get; set; } = null!;
        public DateTime ExemptionDate { get; set; }
        public string? LegalReference { get; set; }

        public string? DecisionResult { get; set; }
    }

   
    public class ExemptionDetailsDto : ExemptionDto
    {
        public int OwnerId { get; set; }
        public int UnitId { get; set; }

        public string? LegalReference { get; set; }
        public string? ExemptionReason { get; set; }
        public string? InspectionResult { get; set; }
        public string? Notes { get; set; }

        public DateTime? ExemptionStartDate { get; set; }
        public DateTime? ExemptionEndDate { get; set; }

        public List<ExemptionAttachmentDto> Attachments { get; set; } = new();
    }

    public class ExemptionAttachmentDto
    {
        public int Id { get; set; }
        public string DocumentType { get; set; } = null!;
        public string FilePath { get; set; } = null!;
    }
    public class AttachmentDto
{
    public byte[] Content { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
}

    public class UpdateExemptionDto
    {
        public string ExemptionType { get; set; } = null!;

        public int UnitId { get; set; }
        public string UnitNumber { get; set; } = null!;

        public DateTime? ExemptionStartDate { get; set; }
        public DateTime? ExemptionEndDate { get; set; }

        public string? LegalReference { get; set; }
    }

    public class RequestHomeDto
{
    public int Id { get; set; }
        public string NationalId { get; set; } = null!;

    public string OwnerName { get; set; } = null!;
        public string UnitNumber { get; set; } = null!;

    public string Status { get; set; } = null!;
    public DateTime RequestDate { get; set; }
    public string? LegalReference { get; set; }

    public string Type { get; set; } = null!; // "إعفاء" أو "طعن"
}

public class AttachmentDownloadDto
{
    public string FullPath { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = "application/octet-stream";
}
}