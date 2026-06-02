using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
 public class Property : BaseEntity<int>
{
    public string BuildingNo { get; set; }

    public string OwnerName { get; set; }

    public int GovernorateId { get; set; }

    public int CenterId { get; set; }

    public int StreetId { get; set; }

    public string CurrentPropertyNo { get; set; }

    public string? OldPropertyNo { get; set; }

    public string? PlanningNo { get; set; }

    public int BuildYear { get; set; }

    public string? Description { get; set; }

    public string Status { get; set; }

    public ICollection<Unit> Units { get; set; }
        = new HashSet<Unit>();
public ICollection<RoleAssignment> Assignments { get; set; }
    = new HashSet<RoleAssignment>();}
}