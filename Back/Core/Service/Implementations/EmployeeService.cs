using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities.AdminModule;
using Core.ServiceAbstraction;
using Shared.DTOS.AdminDTOs;
using System.Security.Cryptography;
using System.Text;

namespace Core.Service.Implementations
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;

        public EmployeeService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync()
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employees = await repo.GetAllAsync();

            return employees.Select(e => MapToDto(e));
        }

        public async Task<EmployeeDto?> GetEmployeeByIdAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employee = await repo.GetByIdAsync(id);

            return employee != null ? MapToDto(employee) : null;
        }

        public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();

            // Check if employee code already exists
            var existingEmployee = (await repo.GetAllAsync())
                .FirstOrDefault(e => e.EmployeeCode == dto.EmployeeCode);

            if (existingEmployee != null)
                throw new InvalidOperationException($"Employee with code {dto.EmployeeCode} already exists.");

            var employee = new Employee
            {
                EmployeeCode = dto.EmployeeCode,
                FullName = dto.FullName,
                JobTitle = dto.JobTitle,
                Department = dto.Department,
                OfficeId = dto.OfficeId,
                Username = dto.Username,
                PasswordHash = HashPassword(dto.Password),
                IsActive = true
            };

            await repo.AddAsync(employee);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(employee);
        }

        public async Task<bool> ToggleEmployeeStatusAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employee = await repo.GetByIdAsync(id);

            if (employee == null)
                return false;

            employee.IsActive = !employee.IsActive;
            repo.Update(employee);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employee = await repo.GetByIdAsync(id);

            if (employee == null)
                return false;

            if (!string.IsNullOrEmpty(dto.FullName))
                employee.FullName = dto.FullName;

            if (!string.IsNullOrEmpty(dto.JobTitle))
                employee.JobTitle = dto.JobTitle;

            if (!string.IsNullOrEmpty(dto.Department))
                employee.Department = dto.Department;

            if (!string.IsNullOrEmpty(dto.OfficeId))
                employee.OfficeId = dto.OfficeId;

            repo.Update(employee);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employee = await repo.GetByIdAsync(id);

            if (employee == null)
                return false;

            repo.Remove(employee);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        private static string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private static EmployeeDto MapToDto(Employee employee)
        {
            return new EmployeeDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                JobTitle = employee.JobTitle,
                Department = employee.Department,
                OfficeId = employee.OfficeId,
                Username = employee.Username,
                IsActive = employee.IsActive,
                CreatedAt = employee.CreatedAt
            };
        }
    }
}
