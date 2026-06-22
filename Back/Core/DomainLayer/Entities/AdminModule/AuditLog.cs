using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities.AdminModule
{
    public class AuditLog : BaseEntity<int>
    {
        public string TableName { get; set; } = null!;

        public string KeyValue { get; set; } = null!;

        public string ActionType { get; set; } = null!;

        public string? OldValues { get; set; }

        public string? NewValues { get; set; }

        public int EmployeeId { get; set; }

        public DateTime ActionDate { get; set; } = DateTime.UtcNow;
    }
}
