using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinanceController : ControllerBase
    {
        private readonly IServiceManager _services;

        public FinanceController(IServiceManager services)
        {
            _services = services;
        }

        // =========================================
        // SEARCH
        // =========================================
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] FinanceSearchRequestDto dto)
        {
            var result = await _services.FinanceService.SearchAsync(dto);
            return Ok(result);
        }

        // =========================================
        // PAYMENT
        // =========================================
        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] CreatePaymentDto dto)
        {
            var result = await _services.FinanceService.RegisterPaymentAsync(dto);
            return Ok(result);
        }

        // =========================================
        // HISTORY
        // =========================================
        [HttpGet("history")]
        public async Task<IActionResult> History()
        {
            var result = await _services.FinanceService.GetPaymentHistoryAsync();
            return Ok(result);
        }

        // =========================================
        // DASHBOARD
        // =========================================
        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var result = await _services.FinanceService.GetDashboardAsync();
            return Ok(result);
        }

        // =========================================
        // OVERDUE UPDATE
        // =========================================
        [HttpPost("update-overdue")]
        public async Task<IActionResult> UpdateOverdue()
        {
            await _services.FinanceService.UpdateOverdueInstallmentsAsync();
            return Ok(new
            {
                message = "Updated successfully"
            });
        }
    }
}