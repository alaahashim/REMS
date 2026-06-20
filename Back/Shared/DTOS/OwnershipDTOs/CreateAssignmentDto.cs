
namespace Shared.DTOS;

public class CreateAssignmentDto
{
    public string PersonId { get; set; } = null!;
    public string PersonName { get; set; } = null!;
    public string ContactPhone { get; set; } = null!;
    public string Address { get; set; } = null!;

    public int PropertyId { get; set; }
    public int UnitId { get; set; }

    public string RoleType { get; set; } = null!;
    public string ShareType { get; set; } = null!;
    public double SharePercentage { get; set; }

    public DateTime OwnershipStartDate { get; set; }
    public DateTime? OwnershipEndDate { get; set; }

    public bool IsActive { get; set; }
}