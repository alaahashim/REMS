using Core.DomainLayer.Entities;
using Core.Specifications;

namespace  Core.Specifications
{
    public class StreetByCenterSpecification
        : BaseSpecifications<Street, int>
    {
        public StreetByCenterSpecification(int centerId)
            : base(s => s.CenterId == centerId)
        {
        }
    }
}