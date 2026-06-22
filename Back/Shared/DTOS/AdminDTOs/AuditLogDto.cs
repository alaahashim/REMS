namespace Shared.DTOS.AdminDTOs
{
    public class AuditLogDto
    {
        public int Id { get; set; }

        public string TableName { get; set; } = null!;

        public string KeyValue { get; set; } = null!;

        public string ActionType { get; set; } = null!;

        public string? OldValues { get; set; }

        public string? NewValues { get; set; }

        public int EmployeeId { get; set; }

        public DateTime ActionDate { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
