namespace Shared.DTOS;
public class AssignmentDto
{
    public int Id { get; set; }

    public string OwnerName { get; set; } = null!;
    public string NationalId { get; set; } = null!;

    public int UnitId { get; set; }

    public string RoleType { get; set; } = null!;
    public string ShareType { get; set; } = null!;
    public double SharePercentage { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public bool IsActive { get; set; }
}
public class UpdateAssignmentDto
{
    public DateTime  StartDate { get; set; }
    public DateTime? EndDate   { get; set; }
    public string    UsageType { get; set; } = null!;
}