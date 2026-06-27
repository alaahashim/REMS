using Core.DomainLayer.Entities;
using Core.Specifications;

namespace Core.Service.Specifications;

public class PendingCommitteeAppealsSpec
    : BaseSpecifications<Appeal,int>
{
    public PendingCommitteeAppealsSpec()
        : base(x=>x.Status==AppealStatus.PendingCommittee)
    {
        AddInclude(x=>x.TaxAssessment);
        AddInclude("TaxAssessment.Owner");
        AddInclude("TaxAssessment.Unit");

        AddOrderByDescending(x=>x.AppealDate);
    }}

public class PendingCommitteeExemptionsSpec
    : BaseSpecifications<Exemption, int>
{
    public PendingCommitteeExemptionsSpec()
        : base(x => x.Status == ExemptionStatus.PendingCommittee)
    {
        AddInclude(x => x.Owner);

        AddInclude(x => x.Unit);

        AddInclude(x => x.Attachments);

        AddOrderByDescending(x => x.ExemptionDate);
    }
}