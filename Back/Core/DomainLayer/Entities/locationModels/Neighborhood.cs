using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Neighborhood : BaseEntity<int>
    {
        public string Name { get; set; }

        public int CenterId { get; set; }

        public string Zone { get; set; }

        public Center Center { get; set; }
    }
}
