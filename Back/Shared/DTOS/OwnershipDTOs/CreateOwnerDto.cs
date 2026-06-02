namespace Shared.DTOS;

public class CreateOwnerDto
{
    public string NationalId { get; set; }=null!;   

    public string FullName { get; set; }=null!;

    public string Phone { get; set; }=null!;

    public string Address { get; set; }=null!;

    public string OwnerType { get; set; }=null!;
}