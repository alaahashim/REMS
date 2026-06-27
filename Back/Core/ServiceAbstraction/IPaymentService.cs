using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IFinanceService
    {
        // البحث بالرقم القومي أو اسم المواطن
        Task<FinanceSearchResponseDto?> SearchAsync(
            FinanceSearchRequestDto dto);

        // تسجيل عملية الدفع
        Task<PaymentReceiptDto> RegisterPaymentAsync(
            CreatePaymentDto dto);

        // سجل جميع المدفوعات
        Task<IEnumerable<PaymentHistoryDto>>
            GetPaymentHistoryAsync();

        // Dashboard
        Task<FinanceDashboardDto>
            GetDashboardAsync();

        // تحديث الأقساط المتأخرة
        Task UpdateOverdueInstallmentsAsync();
    }
}