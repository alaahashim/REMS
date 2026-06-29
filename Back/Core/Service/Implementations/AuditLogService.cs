using System.Text.RegularExpressions;
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
            var logs = await GetOrderedLogsAsync();
            var employees = await GetEmployeesByIdAsync();

            return logs.Take(count).Select(l => MapToDto(l, employees)).ToList();
        }

        public async Task<IEnumerable<AuditLogDto>> GetLogsByTableAsync(string tableName, int count = 10)
        {
            var logs = await GetOrderedLogsAsync();
            var employees = await GetEmployeesByIdAsync();

            return logs
                .Where(l => l.TableName == tableName)
                .Take(count)
                .Select(l => MapToDto(l, employees))
                .ToList();
        }

        public async Task<IEnumerable<AuditLogDto>> GetLogsByEmployeeAsync(int employeeId, int count = 10)
        {
            var logs = await GetOrderedLogsAsync();
            var employees = await GetEmployeesByIdAsync();

            return logs
                .Where(l => l.EmployeeId == employeeId)
                .Take(count)
                .Select(l => MapToDto(l, employees))
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
            var now = DateTime.UtcNow;

            var auditLog = new AuditLog
            {
                TableName = tableName,
                KeyValue = keyValue,
                ActionType = actionType,
                OldValues = oldValues,
                NewValues = newValues,
                EmployeeId = employeeId,
                ActionDate = now,
                CreatedAt = now,
                UpdatedAt = now,
                CreatedBy = employeeId,
                UpdatedBy = employeeId
            };

            await repo.AddAsync(auditLog);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task<List<AuditLog>> GetOrderedLogsAsync()
        {
            var repo = _unitOfWork.GetRepository<AuditLog, int>();
            var logs = await repo.GetAllAsync();

            return logs.OrderByDescending(l => l.ActionDate).ToList();
        }

        private async Task<Dictionary<int, Employee>> GetEmployeesByIdAsync()
        {
            var employeeRepo = _unitOfWork.GetRepository<Employee, int>();
            var employees = await employeeRepo.GetAllAsync();

            return employees.ToDictionary(e => e.Id);
        }

        private static AuditLogDto MapToDto(AuditLog auditLog, IReadOnlyDictionary<int, Employee> employeesById)
        {
            var actorName = employeesById.TryGetValue(auditLog.EmployeeId, out var actor)
                ? actor.FullName
                : "Admin";

            var target = ResolveTargetEmployee(auditLog, employeesById);
            var displayAction = GetDisplayAction(auditLog.ActionType);

            return new AuditLogDto
            {
                Id = auditLog.Id,
                TableName = auditLog.TableName,
                KeyValue = auditLog.KeyValue,
                ActionType = auditLog.ActionType,
                OldValues = StripHtml(auditLog.OldValues),
                NewValues = StripHtml(auditLog.NewValues),
                EmployeeId = auditLog.EmployeeId,
                EmployeeName = actorName,
                ActorName = actorName,
                TargetEmployeeName = target.Name,
                TargetNationalId = target.NationalId,
                TargetEmployeeCode = target.EmployeeCode,
                DisplayAction = displayAction,
                FormattedMessage = BuildFormattedMessage(displayAction, target, auditLog),
                ActionDate = auditLog.ActionDate,
                CreatedAt = auditLog.CreatedAt
            };
        }

        private static (string Name, string? NationalId, string? EmployeeCode) ResolveTargetEmployee(
            AuditLog auditLog,
            IReadOnlyDictionary<int, Employee> employeesById)
        {
            if (int.TryParse(auditLog.KeyValue, out var targetId) &&
                employeesById.TryGetValue(targetId, out var employee))
            {
                return (employee.FullName, employee.NationalId, employee.EmployeeCode);
            }

            var details = $"{auditLog.NewValues} | {auditLog.OldValues}";
            var name = ExtractField(details, "FullName") ??
                       ExtractField(details, "Name") ??
                       ExtractEmployeeNameFromArabic(details) ??
                       "غير معروف";

            var nationalId = ExtractField(details, "NationalId") ??
                             ExtractField(details, "NationalID") ??
                             ExtractArabicNationalId(details);

            var employeeCode = ExtractField(details, "EmployeeCode") ??
                               ExtractArabicEmployeeCode(details);

            return (name, nationalId, employeeCode);
        }

        private static string BuildFormattedMessage(
            string displayAction,
            (string Name, string? NationalId, string? EmployeeCode) target,
            AuditLog auditLog)
        {
            var newValues = StripHtml(auditLog.NewValues);
            if (!string.IsNullOrWhiteSpace(newValues) &&
                newValues.StartsWith("تغيير حالة الموظف", StringComparison.Ordinal))
            {
                return newValues;
            }

            var parts = new List<string>
            {
                $"{displayAction} {target.Name}"
            };

            if (!string.IsNullOrWhiteSpace(target.NationalId))
                parts.Add($"الرقم القومي: {target.NationalId}");

            if (!string.IsNullOrWhiteSpace(target.EmployeeCode))
                parts.Add($"كود: {target.EmployeeCode}");

            return parts.Count == 1
                ? parts[0]
                : $"{parts[0]} - {string.Join(" | ", parts.Skip(1))}.";
        }

        private static string GetDisplayAction(string? actionType)
        {
            return (actionType ?? string.Empty).Trim().ToUpperInvariant() switch
            {
                "CREATE" or "INSERT" => "تم إضافة حساب الموظف",
                "UPDATE" => "تم تعديل حساب الموظف",
                "DELETE" => "تم حذف حساب الموظف",
                "LOGIN" => "تم تسجيل دخول الموظف",
                _ => "تم تسجيل نشاط للموظف"
            };
        }

        private static string? ExtractField(string? text, string field)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null;

            var match = Regex.Match(text, $@"{Regex.Escape(field)}\s*:\s*([^,|\r\n]+)", RegexOptions.IgnoreCase);
            return match.Success ? StripHtml(match.Groups[1].Value.Trim()) : null;
        }

        private static string? ExtractEmployeeNameFromArabic(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null;

            var match = Regex.Match(text, @"الموظف\s*:?\s*([^-|,\r\n]+)");
            return match.Success ? StripHtml(match.Groups[1].Value.Trim()) : null;
        }

        private static string? ExtractArabicNationalId(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null;

            var match = Regex.Match(text, @"الرقم القومي\s*:\s*(\d+)");
            return match.Success ? match.Groups[1].Value.Trim() : null;
        }

        private static string? ExtractArabicEmployeeCode(string? text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return null;

            var match = Regex.Match(text, @"كود\s*:\s*([^,|\r\n.]+)");
            return match.Success ? StripHtml(match.Groups[1].Value.Trim()) : null;
        }

        private static string? StripHtml(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return value;

            return Regex.Replace(value, "<.*?>", string.Empty).Trim();
        }
    }
}
