using Core.DomainLayer.Entities;
using Core.DomainLayer.Entities.Common;

public class Owner : BaseEntity<int>
{
    public string NationalId { get; set; }=null!;

    public string FullName { get; set; }=null!;

    public string Phone { get; set; }=null!;

    public string Address { get; set; }=null!;

    public string OwnerType { get; set; }=null!;

    public bool IsActive { get; set; }


    public ICollection<RoleAssignment> Assignments { get; set; }
        = new HashSet<RoleAssignment>();
}