using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IAppealService
    {
        Task<PagedResultDto<AppealAssessmentLookupDto>> SearchAssessmentsForAppealAsync(AppealAssessmentSearchQueryDto query);

        Task<PagedResultDto<AppealListItemDto>> GetAppealsAsync(AppealListQueryDto query);

        Task<AppealDetailsDto> GetAppealByIdAsync(int id);

        Task<AppealCreateResultDto> CreateAppealAsync(CreateAppealDto dto);

        Task UpdateAppealAsync(int id, UpdateAppealDto dto);

        Task DeleteAppealAsync(int id, bool removeAppealFee = false);
    }
}