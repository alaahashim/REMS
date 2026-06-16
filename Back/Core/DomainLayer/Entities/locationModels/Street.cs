using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Street : BaseEntity<int>
    {
        public string Name { get; set; }=null!;

        public int CenterId { get; set; }

        public Center Center { get; set; }
    }
}