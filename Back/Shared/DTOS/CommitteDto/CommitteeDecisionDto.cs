namespace Shared.DTOS{

public class CommitteeDecisionDto
{
    public string Verdict { get; set; } = null!;

    public string? Note { get; set; }

    // يستخدم فقط للطعن
    public decimal? NewTaxAmount { get; set; }
}

public class CommitteeAppealDto
{
    public int Id { get; set; }

    public string UnitNumber { get; set; } = string.Empty;

    public string PersonName { get; set; } = string.Empty;

    public string AppealReason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public decimal? ProposedTax { get; set; }
}
public class CommitteeExemptionDto
{
    public int Id { get; set; }

    public string UnitNumber { get; set; } = string.Empty;

    public string PersonName { get; set; } = string.Empty;

    public string ExemptionType { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string? FileName { get; set; }
}
}