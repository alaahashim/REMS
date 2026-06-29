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

        public string EmployeeName { get; set; } = null!;

        public string ActorName { get; set; } = null!;

        public string? TargetEmployeeName { get; set; }

        public string? TargetNationalId { get; set; }

        public string? TargetEmployeeCode { get; set; }

        public string DisplayAction { get; set; } = null!;

        public string FormattedMessage { get; set; } = null!;

        public DateTime ActionDate { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
