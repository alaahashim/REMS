using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    

    public interface IOwnerService
{
    Task<IEnumerable<OwnerDto>> GetOwnersAsync();

    Task<OwnerDto?> GetOwnerByIdAsync(int id);

    Task<int> CreateOwnerAsync(CreateOwnerDto dto);

    Task UpdateOwnerAsync(int id, UpdateOwnerDto dto);

    Task DeleteOwnerAsync(int id);
}
}