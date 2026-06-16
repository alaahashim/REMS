using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Governorate : BaseEntity<int>
    {
        public string Name { get; set; }=null!;

        public ICollection<Center> Centers { get; set; }
            = new HashSet<Center>();
    }
}