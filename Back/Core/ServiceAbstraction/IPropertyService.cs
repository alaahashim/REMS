using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IPropertyService
    {
        Task<int> AddPropertyAsync(CreatePropertyWithUnitsDto dto);

        Task AddUnitAsync(UnitDto dto);

        Task<IEnumerable<PropertyDto>> GetPropertiesAsync();

        Task<IEnumerable<UnitDto>> GetUnitsAsync(int? propertyId);

        Task DeletePropertyAsync(int propertyId);

        Task UpdatePropertyStatusAsync(int id, string status);
    }
}