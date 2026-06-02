namespace Shared.DTOS
{
    public class CreateAssignmentDto
    {
        public int PropertyId { get; set; }

        public int? UnitId { get; set; }

        public string PersonId { get; set; }

        public string Name { get; set; }

        public string RoleType { get; set; }

        public string ShareType { get; set; }

        public double SharePercentage { get; set; }

        public DateOnly OwnershipStartDate { get; set; }

        public DateOnly? OwnershipEndDate { get; set; }
    }
}