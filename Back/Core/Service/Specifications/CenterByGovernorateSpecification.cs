using Core.DomainLayer.Entities;
using Core.Specifications;

namespace  Core.Specifications
{
    public class CenterByGovernorateSpecification
        : BaseSpecifications<Center, int>
    {
        public CenterByGovernorateSpecification(int govId)
            : base(c => c.GovernorateId == govId)
        {
        }
    }
}