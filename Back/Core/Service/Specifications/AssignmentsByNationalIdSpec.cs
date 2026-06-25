using Core.DomainLayer.Entities;
using Core.Specifications;
namespace Core.Service.Specifications
{
public class AssignmentsByNationalIdSpec : BaseSpecifications<RoleAssignment, int>
{
    public AssignmentsByNationalIdSpec(string nationalId)
        : base(x => x.Owner != null && x.Owner.NationalId == nationalId)
    {
        AddInclude(x => x.Owner);
        AddInclude(x => x.Unit);
    }


}

public class AssignmentsWithIncludesSpec : BaseSpecifications<RoleAssignment, int>
{
    public AssignmentsWithIncludesSpec()
    {
        AddInclude(x => x.Owner);
        AddInclude(x => x.Unit);
    }
}

public class PropertyWithUnitsSpec : BaseSpecifications<Property, int>
{
    public PropertyWithUnitsSpec()
    {
        AddInclude(x => x.Units);
    }

    public PropertyWithUnitsSpec(int id)
        : base(x => x.Id == id)
    {
        AddInclude(x => x.Units);
    }



}


public class AssignmentsByOwnerIdSpec : BaseSpecifications<RoleAssignment, int>
{
    public AssignmentsByOwnerIdSpec(int ownerId)
        : base(a => a.OwnerId == ownerId)
    {
        AddInclude(a => a.Unit);
        AddInclude(a => a.Unit.Property);
    }


 public class AssignmentsByOwnerIdWithAddressSpec 
    : BaseSpecifications<RoleAssignment, int>
{
    public AssignmentsByOwnerIdWithAddressSpec(int ownerId)
        : base(a => a.OwnerId == ownerId)
    {
        AddInclude(a => a.Unit);
        AddInclude(a => a.Unit.Property);
        AddInclude(a => a.Unit.Property.Neighborhood);          // ← الآن يعمل
        AddInclude(a => a.Unit.Property.Governorate);           // ← الآن يعمل
    }
}
}}