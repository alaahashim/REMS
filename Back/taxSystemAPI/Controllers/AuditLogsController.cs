using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogsController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        /// <summary>
        /// Get latest audit logs
        /// </summary>
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestLogs([FromQuery] int count = 10)
        {
            if (count <= 0 || count > 100)
                count = 10;

            var result = await _auditLogService.GetLatestLogsAsync(count);
            return Ok(result);
        }

        /// <summary>
        /// Get audit logs for a specific table
        /// </summary>
        [HttpGet("table/{tableName}")]
        public async Task<IActionResult> GetLogsByTable(string tableName, [FromQuery] int count = 10)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest(new { message = "Table name is required" });

            if (count <= 0 || count > 100)
                count = 10;

            var result = await _auditLogService.GetLogsByTableAsync(tableName, count);
            return Ok(result);
        }

        /// <summary>
        /// Get audit logs for a specific employee
        /// </summary>
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetLogsByEmployee(int employeeId, [FromQuery] int count = 10)
        {
            if (employeeId <= 0)
                return BadRequest(new { message = "Valid employee ID is required" });

            if (count <= 0 || count > 100)
                count = 10;

            var result = await _auditLogService.GetLogsByEmployeeAsync(employeeId, count);
            return Ok(result);
        }

        /// <summary>
        /// Get all audit logs (Admin only)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllLogs([FromQuery] int count = 50)
        {
            if (count <= 0 || count > 500)
                count = 50;

            var result = await _auditLogService.GetLatestLogsAsync(count);
            return Ok(result);
        }
    }
}
