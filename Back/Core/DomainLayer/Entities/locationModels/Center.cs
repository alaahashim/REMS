using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Center : BaseEntity<int>
    {
        public string Name { get; set; }=null!;

        public int GovernorateId { get; set; }

        public Governorate Governorate { get; set; }

        public ICollection<Street> Streets { get; set; }
            = new HashSet<Street>();
    }
}