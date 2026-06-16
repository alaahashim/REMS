using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Neighborhood : BaseEntity<int>
    {
        public string Name { get; set; }=null!;

        public int CenterId { get; set; }

        public string Zone { get; set; }=null!;

        public Center Center { get; set; }
    }
}
