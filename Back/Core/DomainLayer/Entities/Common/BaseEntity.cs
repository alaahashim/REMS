namespace Core.DomainLayer.Entities.Common
{
    public class BaseEntity<Tkey>
    {
        public Tkey Id { get; set; }
         public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int CreatedBy { get; set; } 
        public int UpdatedBy { get; set; } 
    }
}