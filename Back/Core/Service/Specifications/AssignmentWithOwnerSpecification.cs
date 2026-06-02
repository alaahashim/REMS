using Core.DomainLayer.Entities;
using Core.Specifications;

namespace Core.Service.Specifications
{
    public class AssignmentWithOwnerSpecification
        : BaseSpecifications<RoleAssignment, int>
    {
        public AssignmentWithOwnerSpecification()
        {
            AddInclude(x => x.Owner);
            AddInclude(x => x.Property);
            AddInclude(x => x.Unit);
        }

        public AssignmentWithOwnerSpecification(int assignmentId)
            : base(x => x.Id == assignmentId)
        {
            AddInclude(x => x.Owner);
            AddInclude(x => x.Property);
            AddInclude(x => x.Unit);
        }

        public AssignmentWithOwnerSpecification(string nationalId)
            : base(x => x.Owner.NationalId == nationalId)
        {
            AddInclude(x => x.Owner);
            AddInclude(x => x.Property);
            AddInclude(x => x.Unit);
        }
    }
}