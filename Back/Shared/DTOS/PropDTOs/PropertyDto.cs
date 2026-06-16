namespace Shared.DTOS
{
     public class PropertyDto
    {
        public int Id { get; set; }
        public string BuildingNo { get; set; }
        public int NeighborhoodId { get; set; }
        public int GovernorateId { get; set; }
        public int CenterId { get; set; }
        public int StreetId { get; set; }
        public string CurrentPropertyNo { get; set; }
        public string? OldPropertyNo { get; set; }
        public string? PlanningNo { get; set; }
        public int BuildYear { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
    }
}