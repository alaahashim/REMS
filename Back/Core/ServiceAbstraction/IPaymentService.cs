using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IFinanceService
    {
        // البحث بالرقم القومي أو اسم المواطن
Task<FinanceSearchResponseDto?> SearchAsync(FinanceSearchRequestDto dto);

Task<IEnumerable<EmployeePerformanceDto>>
    GetEmployeesPerformanceAsync();
        // تسجيل عملية الدفع
        Task<PaymentReceiptDto> RegisterPaymentAsync(
            CreatePaymentDto dto);

        // سجل جميع المدفوعات
        

        // Dashboard
        Task<FinanceDashboardDto>
            GetDashboardAsync();

        // تحديث الأقساط المتأخرة
        Task UpdateOverdueInstallmentsAsync();

        Task<PagedResult<PaymentHistoryDto>> GetPaymentHistoryAsync(int pageIndex = 1, int pageSize = 8);
    }
}