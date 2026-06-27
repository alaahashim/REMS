using Shared.DTOS.AdminDTOs;

namespace Core.ServiceAbstraction
{
    public interface IAuditLogService
    {
        Task<IEnumerable<AuditLogDto>> GetLatestLogsAsync(int count = 10);

        Task<IEnumerable<AuditLogDto>> GetLogsByTableAsync(string tableName, int count = 10);

        Task<IEnumerable<AuditLogDto>> GetLogsByEmployeeAsync(int employeeId, int count = 10);

        Task LogActionAsync(string tableName, string keyValue, string actionType, string? oldValues, string? newValues, int employeeId);
    }
}
