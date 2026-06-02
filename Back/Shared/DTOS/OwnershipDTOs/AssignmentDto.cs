namespace Shared.DTOS
{
    public class AssignmentDto
    {
        public int Id { get; set; }

        public int PropertyId { get; set; }

        public int? UnitId { get; set; }

        public string PersonId { get; set; } = null!;

        public string Name { get; set; } = null!;

        public string RoleType { get; set; } = null!;

        public string ShareType { get; set; } = null!;

        public double SharePercentage { get; set; }

        public DateOnly OwnershipStartDate { get; set; }

        public DateOnly? OwnershipEndDate { get; set; }
    }
}