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

    public class PropertyHomeDto
{
   public int Id { get; set; }
        public string RefNo { get; set; } = string.Empty;
        public string? BuildingNo { get; set; }
          public string? UnitNumber { get; set; }

        public string governorate { get; set; } = string.Empty;
        public string neighborhood { get; set; } = string.Empty;
        public string? OwnerName { get; set; }
        public string UnitType { get; set; } = "عقار";
        public double Area { get; set; }
        public List<UnitDto> Units { get; set; } = new();
}
}