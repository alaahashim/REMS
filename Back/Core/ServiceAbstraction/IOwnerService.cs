using Shared.DTOS;

public interface IOwnerService
{
    Task<IEnumerable<OwnerDto>> GetAllAsync(string? search);
    Task<OwnerDto> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateOwnerDto dto);
}