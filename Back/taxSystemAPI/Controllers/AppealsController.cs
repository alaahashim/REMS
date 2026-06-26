using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppealsController : ControllerBase
    {
        private readonly IServiceManager _serviceManager;

        public AppealsController(IServiceManager serviceManager)
        {
            _serviceManager = serviceManager;
        }

        /// <summary>
        /// البحث في التقييمات الضريبية المعتمدة لإنشاء طعن
        /// البحث باسم المالك / الرقم القومي / رقم الوحدة
        /// </summary>
        [HttpGet("assessment-lookup")]
        public async Task<ActionResult<PagedResultDto<AppealAssessmentLookupDto>>> SearchAssessmentsForAppeal(
            [FromQuery] AppealAssessmentSearchQueryDto query)
        {
            var result = await _serviceManager.AppealService.SearchAssessmentsForAppealAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// قائمة الطعون
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResultDto<AppealListItemDto>>> GetAppeals(
            [FromQuery] AppealListQueryDto query)
        {
            var result = await _serviceManager.AppealService.GetAppealsAsync(query);
            return Ok(result);
        }

        /// <summary>
        /// تفاصيل طعن واحد
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AppealDetailsDto>> GetAppealById(int id)
        {
            var result = await _serviceManager.AppealService.GetAppealByIdAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// إنشاء طعن جديد
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<AppealCreateResultDto>> CreateAppeal([FromBody] CreateAppealDto dto)
        {
            var result = await _serviceManager.AppealService.CreateAppealAsync(dto);
            return Ok(result);
        }

        /// <summary>
        /// تعديل طعن موجود
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAppeal(int id, [FromBody] UpdateAppealDto dto)
        {
            await _serviceManager.AppealService.UpdateAppealAsync(id, dto);
            return Ok(new { success = true, message = "تم تحديث الطعن بنجاح" });
        }

        /// <summary>
        /// حذف الطعن
        /// removeAppealFee = true لو أردت حذف رسوم الطعن من التقييم أيضًا
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteAppeal(int id, [FromQuery] bool removeAppealFee = false)
        {
            await _serviceManager.AppealService.DeleteAppealAsync(id, removeAppealFee);
            return Ok(new
            {
                success = true,
                message = removeAppealFee
                    ? "تم حذف الطعن وحذف رسوم الطعن من التقييم الضريبي"
                    : "تم حذف الطعن مع الإبقاء على رسوم الطعن في التقييم الضريبي"
            });
        }
    }
}