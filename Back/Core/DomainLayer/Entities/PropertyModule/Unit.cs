using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class Unit : BaseEntity<int>
    {

        public int PropertyId { get; set; }

        public string UnitNumber { get; set; }

        public int Floor { get; set; }

        public double Area { get; set; }

        public string UsageType { get; set; }

        public string FinishingType { get; set; } = "Unknown";
        public string UnitType { get; set; }


         public string Status { get; set; } = "Available"; 
        // Navigation
        public Property Property { get; set; }
        public ICollection<RoleAssignment> Assignments { get; set; }
         = new HashSet<RoleAssignment>();    }
}