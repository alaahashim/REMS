using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;
using Shared.DTOS.AdminDTOs;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminEmployeesController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;
        private readonly IAuditLogService _auditLogService;

        public AdminEmployeesController(
            IServiceManager serviceManager,
            IAuditLogService auditLogService)
        {
            _serviceManager = serviceManager;
            _auditLogService = auditLogService;
        }

        /// <summary>
        /// Get all employees
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllEmployees()
        {
            var result = await _serviceManager.EmployeeService.GetAllEmployeesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get employee by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            var result = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(id);

            if (result == null)
                return NotFound(new { message = "Employee not found" });

            return Ok(result);
        }

        /// <summary>
        /// Create a new employee
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // 1. تنفيذ عملية الحفظ الأساسية للموظف أولاً
                var result = await _serviceManager.EmployeeService.CreateEmployeeAsync(dto);

                // 2. تأمين الـ Audit Log في بلوك try-catch منفصل
                try
                {
                    await _auditLogService.LogActionAsync(
                        tableName: "Employees",
                        keyValue: result.Id.ToString(),
                        actionType: "CREATE",
                        oldValues: null,
                        newValues: $"EmployeeCode: {result.EmployeeCode}, FullName: {result.FullName}",
                        employeeId: 1 // ملحوظة: الـ ID ده ثابت وممكن يتغير لاحقاً بناءً على الـ Token
                    );
                }
                catch (Exception logEx)
                {
                    // لو اللوج فشل لأي سبب (حقل ناقص أو خطأ داتا بيز) العملية الأساسية للموظف لا تتأثر
                    Console.WriteLine($"[AuditLog Error]: Failed to write log for CreateEmployee. Details: {logEx.Message}");
                }

                return CreatedAtAction(nameof(GetEmployeeById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Toggle employee status (activate/deactivate)
        /// </summary>
        [HttpPut("toggle-status/{id}")]
        public async Task<IActionResult> ToggleEmployeeStatus(int id)
        {
            var employee = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(id);

            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            var oldStatus = employee.IsActive;
            var result = await _serviceManager.EmployeeService.ToggleEmployeeStatusAsync(id);

            if (!result)
                return BadRequest(new { message = "Failed to toggle employee status" });

            // تأمين الـ Audit Log من التسبب في فشل الـ Request
            try
            {
                await _auditLogService.LogActionAsync(
                    tableName: "Employees",
                    keyValue: id.ToString(),
                    actionType: "UPDATE",
                    oldValues: $"IsActive: {oldStatus}",
                    newValues: $"IsActive: {!oldStatus}",
                    employeeId: 1
                );
            }
            catch (Exception logEx)
            {
                Console.WriteLine($"[AuditLog Error]: Failed to write log for ToggleStatus. Details: {logEx.Message}");
            }

            var updatedEmployee = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(id);
            return Ok(new { message = $"Employee status toggled to {updatedEmployee?.IsActive}", data = updatedEmployee });
        }

        /// <summary>
        /// Update employee details
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var employee = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(id);

            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            var oldValues = $"FullName: {employee.FullName}, JobTitle: {employee.JobTitle}, Department: {employee.Department}, OfficeId: {employee.OfficeId}";

            var result = await _serviceManager.EmployeeService.UpdateEmployeeAsync(id, dto);

            if (!result)
                return BadRequest(new { message = "Failed to update employee" });

            var updatedEmployee = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(id);

            // تأمين الـ Audit Log
            try
            {
                await _auditLogService.LogActionAsync(
                    tableName: "Employees",
                    keyValue: id.ToString(),
                    actionType: "UPDATE",
                    oldValues: oldValues,
                    newValues: $"FullName: {updatedEmployee?.FullName}, JobTitle: {updatedEmployee?.JobTitle}, Department: {updatedEmployee?.Department}, OfficeId: {updatedEmployee?.OfficeId}",
                    employeeId: 1
                );
            }
            catch (Exception logEx)
            {
                Console.WriteLine($"[AuditLog Error]: Failed to write log for UpdateEmployee. Details: {logEx.Message}");
            }

            return Ok(new { message = "Employee updated successfully", data = updatedEmployee });
        }

        /// <summary>
        /// Delete an employee
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(id);

            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            var result = await _serviceManager.EmployeeService.DeleteEmployeeAsync(id);

            if (!result)
                return BadRequest(new { message = "Failed to delete employee" });

            // تأمين الـ Audit Log
            try
            {
                await _auditLogService.LogActionAsync(
                    tableName: "Employees",
                    keyValue: id.ToString(),
                    actionType: "DELETE",
                    oldValues: $"EmployeeCode: {employee.EmployeeCode}, FullName: {employee.FullName}",
                    newValues: null,
                    employeeId: 1
                );
            }
            catch (Exception logEx)
            {
                Console.WriteLine($"[AuditLog Error]: Failed to write log for DeleteEmployee. Details: {logEx.Message}");
            }

            return Ok(new { message = "Employee deleted successfully" });
        }
    }
}