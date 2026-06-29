using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities.AdminModule;
using Core.Service.Helpers;
using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Http;
using Shared.DTOS.AdminDTOs;

namespace Core.Service.Implementations
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public EmployeeService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync(string? searchQuery = null)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employees = await repo.GetAllAsync();

            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                var query = searchQuery.Trim();
                employees = employees.Where(e =>
                    e.FullName.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    e.NationalId.Contains(query, StringComparison.OrdinalIgnoreCase));
            }

            var employeeList = employees.ToList();
            var namesById = employeeList.ToDictionary(e => e.Id, e => e.FullName);

            return employeeList.Select(e => MapToDto(e, namesById));
        }

        public async Task<EmployeeDto?> GetEmployeeByIdAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employee = await repo.GetByIdAsync(id);

            if (employee == null)
                return null;

            var namesById = (await repo.GetAllAsync()).ToDictionary(e => e.Id, e => e.FullName);
            return MapToDto(employee, namesById);
        }

        public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();

            var existingEmployee = (await repo.GetAllAsync())
                .FirstOrDefault(e => e.NationalId == dto.NationalId);

            if (existingEmployee != null)
                throw new InvalidOperationException("الرقم القومي مسجل مسبقا");

            var currentEmployeeId = CurrentUserHelper.GetCurrentEmployeeId(_httpContextAccessor);

            var employee = new Employee
            {
                EmployeeCode = dto.EmployeeCode,
                FullName = dto.FullName,
                NationalId = dto.NationalId,
                JobTitle = dto.JobTitle,
                Department = dto.Department,
                OfficeId = dto.OfficeId,
                Username = dto.Username,
                PasswordHash = PasswordHashHelper.HashPassword(dto.Password),
                Email = dto.Email,
                Phone = dto.Phone,
                PicturePath = dto.PicturePath,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = currentEmployeeId,
                UpdatedBy = currentEmployeeId
            };

            await repo.AddAsync(employee);
            await _unitOfWork.SaveChangesAsync();

            var namesById = (await repo.GetAllAsync()).ToDictionary(e => e.Id, e => e.FullName);
            return MapToDto(employee, namesById);
        }

        public async Task<bool> ToggleEmployeeStatusAsync(int id)
        {
            var repo = _unitOfWork.GetRepository<Employee, int>();
            var employee = await repo.GetByIdAsync(id);

            if (employee == null)
                return false;

            employee.IsActive = !employee.IsActive;
            employee.UpdatedAt = DateTime.UtcNow;
            employee.UpdatedBy = CurrentUserHelper.GetCurrentEmployeeId(_httpContextAccessor);

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

            if (!string.IsNullOrEmpty(dto.NationalId))
            {
                var existingEmployee = (await repo.GetAllAsync())
                    .FirstOrDefault(e => e.Id != id && e.NationalId == dto.NationalId);

                if (existingEmployee != null)
                    throw new InvalidOperationException("الرقم القومي مسجل مسبقا");

                employee.NationalId = dto.NationalId;
            }

            if (!string.IsNullOrEmpty(dto.JobTitle))
                employee.JobTitle = dto.JobTitle;

            if (!string.IsNullOrEmpty(dto.Department))
                employee.Department = dto.Department;

            if (!string.IsNullOrEmpty(dto.OfficeId))
                employee.OfficeId = dto.OfficeId;

            if (!string.IsNullOrEmpty(dto.Email))
                employee.Email = dto.Email;

            if (!string.IsNullOrEmpty(dto.Phone))
                employee.Phone = dto.Phone;

            if (dto.PicturePath != null)
                employee.PicturePath = dto.PicturePath;

            employee.UpdatedAt = DateTime.UtcNow;
            employee.UpdatedBy = CurrentUserHelper.GetCurrentEmployeeId(_httpContextAccessor);

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

        private static EmployeeDto MapToDto(Employee employee, IReadOnlyDictionary<int, string> namesById)
        {
            return new EmployeeDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                NationalId = employee.NationalId,
                JobTitle = employee.JobTitle,
                Department = employee.Department,
                OfficeId = employee.OfficeId,
                Username = employee.Username,
                Email = employee.Email,
                Phone = employee.Phone,
                PicturePath = employee.PicturePath,
                RoleNameArabic = EmployeeRoleHelper.ToArabicName(employee.Department),
                IsActive = employee.IsActive,
                CreatedAt = employee.CreatedAt,
                CreatedBy = employee.CreatedBy,
                CreatedByName = ResolveUserName(employee.CreatedBy, namesById),
                UpdatedBy = employee.UpdatedBy,
                UpdatedByName = ResolveUserName(employee.UpdatedBy, namesById)
            };
        }

        private static string ResolveUserName(int employeeId, IReadOnlyDictionary<int, string> namesById)
        {
            if (employeeId > 0 &&
                namesById.TryGetValue(employeeId, out var name) &&
                !string.IsNullOrWhiteSpace(name))
            {
                return name;
            }

            return "Admin";
        }
    }
}
