using Core.DomainLayer.Entities;

namespace Shared.DTOS;

public class ManagerDecisionDto
{
    /// <summary>
    /// القرار النهائي
    /// يجب أن يكون Approved أو Rejected فقط
    /// </summary>
    public AppealStatus Status { get; set; }

    /// <summary>
    /// قيمة الضريبة النهائية التى اعتمدها المدير
    /// ترسل فقط عند الموافقة
    /// </summary>
    public decimal? ManagerApprovedTax { get; set; }

    /// <summary>
    /// ملاحظات المدير
    /// </summary>
    public string? Note { get; set; }
}

public class ManagerAppealDto
{
    public int Id { get; set; }

    public string UnitNumber { get; set; } = string.Empty;

    public string PersonName { get; set; } = string.Empty;


    public string? CommitteeVerdict { get; set; }

    public string? CommitteeNote { get; set; }

 
    public decimal OriginalTax { get; set; }

    // الضريبة التى أوصت بها اللجنة
    public decimal? ProposedTax { get; set; }

    public string AppealReason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}






public class ManagerExemptionDto
{
    public int Id { get; set; }

    public int UnitId { get; set; }

    public string UnitNumber { get; set; } = string.Empty;

    public string PersonName { get; set; } = string.Empty;

    public string ExemptionType { get; set; } = string.Empty;

    // توصية اللجنة
    public string? CommitteeVerdict { get; set; }

    public string? CommitteeNote { get; set; }

    // القرار الحالي
    public string Status { get; set; } = string.Empty;

    // الملف إن وجد
    public string? FileName { get; set; }

    // نوع الإعفاء الذى أوصت به اللجنة
    public bool? CommitteeApprove { get; set; }

    public decimal? CommitteeExemptionPercentage { get; set; }

    public decimal? CommitteeApprovedAmount { get; set; }

    public DateTime ExemptionDate { get; set; }
}



public class ManagerExemptionDecisionDto
{
 
    public ExemptionStatus Status { get; set; }

      public decimal? ExemptionPercentage { get; set; }

    public string? Note { get; set; }
}