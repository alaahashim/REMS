namespace Core.DomainLayer.Entities.Common
{
    public class BaseEntity<Tkey>
    {
        public Tkey Id { get; set; }
         public DateTime CreatedAt { get; set; }
    }
}