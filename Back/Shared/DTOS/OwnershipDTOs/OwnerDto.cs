namespace Shared.DTOS;

public class OwnerDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string NationalId { get; set; }
    public string Phone { get; set; }
    public string Address { get; set; }
    public string OwnerType { get; set; }
        public List<UnitDto>? Units { get; set; }=[];

}


public class CreateOwnerDto
{
    public string NationalId { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string OwnerType { get; set; } = "Natural";
}
public class OwnerQueryDto
{
    public string? Search { get; set; }
}

