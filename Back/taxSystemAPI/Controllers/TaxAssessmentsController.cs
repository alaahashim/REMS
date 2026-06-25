using Core.DomainLayer.Exceptions;
using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaxAssessmentsController(IServiceManager service) : ControllerBase
    {
        [HttpGet("reviewer-tasks")]
        public async Task<ActionResult<PagedResultDto<ReviewerTaxTaskListItemDto>>> GetReviewerTasks(
            [FromQuery] ReviewerTaxTasksQueryDto query)
        {
            var result = await service.TaxAssessmentService.GetReviewerTasksAsync(query);
            return Ok(result);
        }

        [HttpGet("reviewer-tasks/{unitId:int}/details")]
        public async Task<ActionResult<ReviewerTaxTaskDetailsDto>> GetReviewerTaskDetails(int unitId)
        {
            var result = await service.TaxAssessmentService.GetReviewerTaskDetailsAsync(unitId);
            return Ok(result);
        }

        [HttpPost("preview")]
        public async Task<ActionResult<TaxCalculationResultDto>> Preview([FromBody] TaxCalculationRequestDto dto)
        {
            var result = await service.TaxAssessmentService.PreviewCalculationAsync(dto);
            return Ok(result);
        }

        [HttpPost("approve")]
        public async Task<IActionResult> Approve([FromBody] ApproveTaxAssessmentDto dto)
        {
            var id = await service.TaxAssessmentService.ApproveCalculationAsync(dto);
            return Ok(new { success = true, assessmentId = id });
        }

        [HttpGet("unit/{unitId:int}/year/{taxYear:int}")]
        public async Task<ActionResult<TaxAssessmentDto>> GetByUnitYear(int unitId, int taxYear)
        {
            var result = await service.TaxAssessmentService.GetAssessmentByUnitYearAsync(unitId, taxYear);

            if (result is null)
                throw new NotFoundException("لا يوجد تقييم ضريبي لهذه الوحدة في السنة المحددة");

            return Ok(result);
        }
    }
}