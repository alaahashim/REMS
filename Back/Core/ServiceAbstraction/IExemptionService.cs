using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IExemptionService
    {
        Task<IEnumerable<ExemptionDto>> GetAllAsync();

        Task<ExemptionDetailsDto?> GetByIdAsync(int id);

        Task<int> CreateAsync(CreateExemptionDto dto, int userId, AttachmentDto? attachment);

        Task<bool> UpdateAsync(int id, UpdateExemptionDto dto, AttachmentDto? attachment);

        Task<bool> DeleteAsync(int id);
    }
}