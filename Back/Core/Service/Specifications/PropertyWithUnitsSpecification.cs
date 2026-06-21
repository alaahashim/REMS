
using Core.DomainLayer.Entities;
using Core.Specifications;
namespace  Core.Specifications
{
public class PropertyWithUnitsSpec : BaseSpecifications<Property, int>
{
    public PropertyWithUnitsSpec()
    {
        AddInclude(x => x.Units);
        AddInclude(x => x.Assignments); // لو فيه مالك
    }

    public PropertyWithUnitsSpec(int id)
        : base(x => x.Id == id)
    {
        AddInclude(x => x.Units);
        AddInclude(x => x.Assignments);
    }
}
public class RoleAssignmentWithDetailsSpec : BaseSpecifications<RoleAssignment, int>
    {
        public RoleAssignmentWithDetailsSpec()
        {
            AddInclude(x => x.Unit);
            AddInclude(x => x.Owner);
        }
    }
}