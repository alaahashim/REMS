using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController(
        IServiceManager service)
        : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult>
            GetAssignments()
        {
            var result =
                await service
                .AssignmentService
                .GetAssignmentsAsync();

            return Ok(result);
        }

        [HttpGet("person/{personId}")]
        public async Task<IActionResult>
            GetAssignmentByPersonId(
            string personId)
        {
            var result =
                await service
                .AssignmentService
                .GetAssignmentByPersonIdAsync(
                    personId);

            if (result is null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "المالك غير موجود"
                });
            }

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult>
            CreateAssignment(
            [FromBody]
            CreateAssignmentDto dto)
        {
            var id =
                await service
                .AssignmentService
                .CreateAssignmentAsync(dto);

            return Ok(new
            {
                success = true,
                assignmentId = id,
                message = "تم إنشاء الربط بنجاح"
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult>
            UpdateAssignment(
            int id,
            [FromBody]
            CreateAssignmentDto dto)
        {
            await service
                .AssignmentService
                .UpdateAssignmentAsync(
                    id,
                    dto);

            return Ok(new
            {
                success = true,
                message = "تم تحديث الربط"
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult>
            DeleteAssignment(
            int id)
        {
            await service
                .AssignmentService
                .DeleteAssignmentAsync(id);

            return Ok(new
            {
                success = true,
                message = "تم حذف الربط"
            });
        }
    }
}