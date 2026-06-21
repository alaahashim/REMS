namespace Shared.DTOS
{
    public class UnitDto
    {
        public int Id { get; set; }
        public int? PropertyId { get; set; }
        public string? UnitNumber { get; set; }
        public int Floor { get; set; }
        public double Area { get; set; }
        public string UsageType { get; set; }
        public string? FinishingType { get; set; }
        public string UnitType { get; set; }
        public string? Status { get; set; }
    }
}