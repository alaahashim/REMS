
namespace Core.DomainLayer.Entities.Common
{
    public class Ownership: BaseEntity<int>
{
    public int PersonId { get; set; }
    public int UnitId { get; set; }

    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }

    public string RoleType { get; set; }
    public string Status { get; set; }

    public bool IsActive { get; set; }
    public bool Exclude { get; set; }
}
}