using Shared.DTOS;

public interface IInstallmentService
{
    Task GenerateInstallmentsAsync(int assessmentId);

    Task<IEnumerable<InstallmentDto>> GetByAssessmentIdAsync(int assessmentId);

    Task<IEnumerable<InstallmentDto>>GetPendingByAssessmentIdAsync(int assessmentId);

    Task UpdateAssessmentPaymentStatusAsync(int assessmentId);

    Task<bool> HasInstallmentsAsync(int assessmentId);
}