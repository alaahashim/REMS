using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities.AdminModule;
using Core.ServiceAbstraction;
using Shared.DTOS.AdminDTOs;

namespace Core.Service.Implementations
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AuditLogService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<AuditLogDto>> GetLatestLogsAsync(int count = 10)
        {
            var repo = _unitOfWork.GetRepository<AuditLog, int>();
            var logs = await repo.GetAllAsync();

            return logs
                .OrderByDescending(l => l.ActionDate)
                .Take(count)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<IEnumerable<AuditLogDto>> GetLogsByTableAsync(string tableName, int count = 10)
        {
            var repo = _unitOfWork.GetRepository<AuditLog, int>();
            var logs = await repo.GetAllAsync();

            return logs
                .Where(l => l.TableName == tableName)
                .OrderByDescending(l => l.ActionDate)
                .Take(count)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<IEnumerable<AuditLogDto>> GetLogsByEmployeeAsync(int employeeId, int count = 10)
        {
            var repo = _unitOfWork.GetRepository<AuditLog, int>();
            var logs = await repo.GetAllAsync();

            return logs
                .Where(l => l.EmployeeId == employeeId)
                .OrderByDescending(l => l.ActionDate)
                .Take(count)
                .Select(MapToDto)
                .ToList();
        }

        public async Task LogActionAsync(
            string tableName,
            string keyValue,
            string actionType,
            string? oldValues,
            string? newValues,
            int employeeId)
        {
            var repo = _unitOfWork.GetRepository<AuditLog, int>();

            var auditLog = new AuditLog
            {
                TableName = tableName,
                KeyValue = keyValue,
                ActionType = actionType,
                OldValues = oldValues,
                NewValues = newValues,
                EmployeeId = employeeId,
                ActionDate = DateTime.UtcNow
            };

            await repo.AddAsync(auditLog);
            await _unitOfWork.SaveChangesAsync();
        }

        private static AuditLogDto MapToDto(AuditLog auditLog)
        {
            return new AuditLogDto
            {
                Id = auditLog.Id,
                TableName = auditLog.TableName,
                KeyValue = auditLog.KeyValue,
                ActionType = auditLog.ActionType,
                OldValues = auditLog.OldValues,
                NewValues = auditLog.NewValues,
                EmployeeId = auditLog.EmployeeId,
                ActionDate = auditLog.ActionDate,
                CreatedAt = auditLog.CreatedAt
            };
        }
    }
}
