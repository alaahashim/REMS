namespace Shared.DTOS
{
    public class PropertyWithUnitsDto
    {
        public int Id { get; set; }
        public string BuildingNo { get; set; }
        public string CurrentPropertyNo { get; set; }
        public string? OldPropertyNo { get; set; }
        public string? Description { get; set; }

        public List<UnitDto> Units { get; set; } = new();
    }
}