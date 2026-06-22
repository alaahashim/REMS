using Shared.DTOS.AdminDTOs;

namespace Core.ServiceAbstraction
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync();

        Task<EmployeeDto?> GetEmployeeByIdAsync(int id);

        Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto);

        Task<bool> ToggleEmployeeStatusAsync(int id);

        Task<bool> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);

        Task<bool> DeleteEmployeeAsync(int id);
    }
}
