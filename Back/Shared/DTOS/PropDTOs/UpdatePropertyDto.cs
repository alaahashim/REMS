namespace Shared.DTOS
{
  public class UpdatePropertyDto
{
    public int GovernorateId { get; set; }

    public int CenterId { get; set; }

    public int NeighborhoodId { get; set; }

    public int StreetId { get; set; }

    public string BuildingNo { get; set; }

    public string? Description { get; set; }
}
}
