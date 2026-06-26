using Shared.DTOS;

public interface IOwnerService
{
    Task<IEnumerable<OwnerDto>> GetAllAsync(string? search);
    Task<OwnerDto> GetByIdAsync(int id);
    Task<OwnerDto?> GetByNationalIdAsync(string nationalId);
    Task<int> CreateAsync(CreateOwnerDto dto);
Task<IEnumerable<OwnerUnitDto>> GetUnitsByOwnerIdAsync(int ownerId);

Task UpdateAsync(int id, UpdateOwnerDto dto);
Task DeleteAsync(int id);
Task<IEnumerable<OwnerUnitEditDto>> GetUnitsForEditAsync(int ownerId);
}