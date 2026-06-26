using Core.DomainLayer.Entities;

namespace Core.Specifications
{
    public class CenterByGovernorateSpecification
        : BaseSpecifications<Center, int>
    {
        public CenterByGovernorateSpecification(
            int governorateId)
            : base(c => c.GovernorateId == governorateId)
        {
            AddOrderBy(c => c.Name);
        }
    }

    public class StreetByCenterSpecification
        : BaseSpecifications<Street, int>
    {
        public StreetByCenterSpecification(int centerId)
            : base(s => s.CenterId == centerId)
        {
            AddOrderBy(s => s.Name);
        }
    }
       public class NeighborhoodByCenterSpecification
        : BaseSpecifications<Neighborhood, int>
    {
        public NeighborhoodByCenterSpecification(
            int centerId)
            : base(n => n.CenterId == centerId)
        {
            AddOrderBy(n => n.Name);
        }
    }

}