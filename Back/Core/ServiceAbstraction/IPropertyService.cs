using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IPropertyService
    {
        Task<int> AddPropertyAsync(CreatePropertyWithUnitsDto dto);

        Task AddUnitAsync(UnitDto dto);

        Task<IEnumerable<PropertyDto>> GetPropertiesAsync();

        // ✅ جديد: الحصول على عقار بـ ID
        Task<PropertyDto> GetPropertyByIdAsync(int propertyId);

        Task<IEnumerable<UnitDto>> GetUnitsAsync(int? propertyId);

        // ✅ جديد: تحديث العقار بشكل شامل
        Task UpdatePropertyAsync(int id, UpdatePropertyDto dto);

        Task UpdatePropertyStatusAsync(int id, string status);
        Task UpdateUnitStatusAsync(int unitId, string status);
        Task DeletePropertyAsync(int propertyId);

        // ✅ جديد: تحديث وحدة محددة
        Task UpdateUnitAsync(int unitId, UnitDto dto);

        // ✅ جديد: حذف وحدة محددة
        Task DeleteUnitAsync(int unitId);
    }
}