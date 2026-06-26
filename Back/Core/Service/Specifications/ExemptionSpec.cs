


using Core.DomainLayer.Entities;
using Core.Specifications;

public class ExemptionHomeSpec : BaseSpecifications<Exemption, int>
    {
        public ExemptionHomeSpec()
        {
            AddInclude(e => e.Owner);
        }
    }

    public class ExemptionWithAttachmentsSpec
    : BaseSpecifications<Exemption,int>
{
    public ExemptionWithAttachmentsSpec(int id)
        : base(x => x.Id == id)
    {
        AddInclude(x => x.Attachments);
    }
}