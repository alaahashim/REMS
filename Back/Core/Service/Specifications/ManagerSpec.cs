using Core.DomainLayer.Entities;
using Core.Specifications;

namespace Core.Service.Specifications;

public class AppealWithTaxAssessmentSpec
    : BaseSpecifications<Appeal, int>
{
    public AppealWithTaxAssessmentSpec(int appealId)
        : base(a => a.Id == appealId)
    {
        AddInclude(a => a.TaxAssessment);

        AddInclude("TaxAssessment.Owner");

        AddInclude("TaxAssessment.Unit");
    }
}

public class PendingManagerAppealsSpec
    : BaseSpecifications<Appeal, int>
{
    public PendingManagerAppealsSpec()
        : base(x => x.Status == AppealStatus.PendingManager)
    {
        AddInclude(x => x.TaxAssessment);

        AddInclude("TaxAssessment.Owner");

        AddInclude("TaxAssessment.Unit");

        AddOrderByDescending(x => x.CommitteeDecisionDate);
    }
}



public class ExemptionWithDetailsSpec
    : BaseSpecifications<Exemption, int>
{
    public ExemptionWithDetailsSpec(int id)
        : base(x => x.Id == id)
    {
        AddInclude(x => x.Owner);

        AddInclude(x => x.Unit);

        AddInclude(x => x.Attachments);
    }
}

public class TaxAssessmentByUnitAndYearSpec
    : BaseSpecifications<TaxAssessment, int>
{
    public TaxAssessmentByUnitAndYearSpec(int unitId, int taxYear)
        : base(x =>
            x.UnitId == unitId &&
            x.TaxYear == taxYear)
    {
        AddInclude(x => x.Owner);
        AddInclude(x => x.Unit);
    }
}

public class PendingManagerExemptionsSpec
    : BaseSpecifications<Exemption, int>
{
    public PendingManagerExemptionsSpec()
        : base(x => x.Status == ExemptionStatus.PendingManager)
    {
        AddInclude(x => x.Owner);

        AddInclude(x => x.Unit);

        AddInclude(x => x.Attachments);

        AddOrderByDescending(x => x.CommitteeDecisionDate);
    }
}