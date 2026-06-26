using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IPropertyService
    {
        Task<int> AddPropertyAsync(CreatePropertyWithUnitsDto dto);
        Task<IEnumerable<PropertyWithUnitsDto>> GetPropertiesWithUnitsAsync();
        Task AddUnitAsync(UnitDto dto);

        Task<IEnumerable<PropertyDto>> GetPropertiesAsync();

        // ✅ الحصول على عقار بـ ID
        Task<PropertyDto?> GetPropertyByIdAsync(int propertyId);

        Task<IEnumerable<UnitDto>> GetUnitsAsync(int? propertyId);

        // ✅ تحديث العقار بشكل شامل
        Task UpdatePropertyAsync(int id, UpdatePropertyDto dto);

        Task UpdatePropertyStatusAsync(int id, string status);
        Task UpdateUnitStatusAsync(int unitId, string status);
        Task DeletePropertyAsync(int propertyId);

        // ✅ تحديث وحدة محددة
        Task UpdateUnitAsync(int unitId, UnitDto dto);

        // ✅ حذف وحدة محددة
        Task DeleteUnitAsync(int unitId);
        Task<IEnumerable<PropertyHomeDto>> GetPropertiesForHomeAsync();
    }
}