using Shared.DTOS;

public interface IOwnerService
{
    Task<IEnumerable<OwnerDto>> GetAllAsync(string? search);
    Task<OwnerDto> GetByIdAsync(int id);
    Task<OwnerDto?> GetByNationalIdAsync(string nationalId);
    Task<int> CreateAsync(CreateOwnerDto dto);
}