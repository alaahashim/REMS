// Presentation/Controllers/InstallmentsController.cs
using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstallmentsController : ControllerBase
    {
        private readonly IServiceManager _services;

        public InstallmentsController(IServiceManager services)
        {
            _services = services;
        }

        // GET /api/installments/{assessmentId}
        // جلب كل الأقساط لتقييم معين
        [HttpGet("{assessmentId:int}")]
        public async Task<IActionResult> GetByAssessment(int assessmentId)
        {
            var result = await _services.InstallmentService
                .GetByAssessmentIdAsync(assessmentId);
            return Ok(result);
        }

        // GET /api/installments/{assessmentId}/pending
        // جلب الأقساط المستحقة فقط (Pending + Overdue)
        [HttpGet("{assessmentId:int}/pending")]
        public async Task<IActionResult> GetPending(int assessmentId)
        {
            var result = await _services.InstallmentService
                .GetPendingByAssessmentIdAsync(assessmentId);
            return Ok(result);
        }

        // POST /api/installments/{assessmentId}/generate
        // توليد الأقساط بعد اعتماد التقييم
        [HttpPost("{assessmentId:int}/generate")]
        public async Task<IActionResult> Generate(int assessmentId)
        {
            await _services.InstallmentService
                .GenerateInstallmentsAsync(assessmentId);
            return Ok(new { message = "تم توليد الأقساط بنجاح" });
        }
    }
}