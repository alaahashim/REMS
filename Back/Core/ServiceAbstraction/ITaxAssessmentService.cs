using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface ITaxAssessmentService
    {
        Task<PagedResultDto<ReviewerTaxTaskListItemDto>> GetReviewerTasksAsync(ReviewerTaxTasksQueryDto query);

        Task<ReviewerTaxTaskDetailsDto> GetReviewerTaskDetailsAsync(int unitId);
        Task<TaxCalculationResultDto> PreviewCalculationAsync(TaxCalculationRequestDto dto);

        Task<int> ApproveCalculationAsync(ApproveTaxAssessmentDto dto);

        Task<TaxAssessmentDto?> GetAssessmentByUnitYearAsync(int unitId, int taxYear);
Task DeleteAssessmentAsync(int unitId, int taxYear, bool deleteRelatedAppeals = false);
Task RevertApprovedAssessmentAsync(int unitId, int taxYear, bool deleteRelatedAppeals = false);
Task<bool> HasAppealsAsync(int unitId, int taxYear);
    }
}