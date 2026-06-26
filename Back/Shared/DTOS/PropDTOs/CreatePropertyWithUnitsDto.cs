namespace Shared.DTOS
{
  public class CreatePropertyWithUnitsDto
{


    public int GovernorateId { get; set; }

    public int CenterId { get; set; }

    public int NeighborhoodId { get; set; }

    public int StreetId { get; set; }

    public string? BuildingNo { get; set; }

    public string? CurrentPropertyNo { get; set; }

    public string? OldPropertyNo { get; set; }

    public string? PlanningNo { get; set; }

    public int BuildYear { get; set; }

    public string? Description { get; set; }

    public List<UnitDto> Units { get; set; } = [];
}
}