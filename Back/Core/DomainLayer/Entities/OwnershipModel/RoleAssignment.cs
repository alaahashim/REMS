using Core.DomainLayer.Entities.Common;
using Core.DomainLayer.Entities;
public class RoleAssignment : BaseEntity<int>
{
    public int OwnerId { get; set; }

    public Owner? Owner { get; set; }

    public int UnitId { get; set; }

    public Unit? Unit { get; set; }

    public string RoleType { get; set; }= null!;

    public string ShareType { get; set; }= null!;
    public double SharePercentage { get; set; }=100;
    public DateTime StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }

    public bool IsActive { get; set; }

}