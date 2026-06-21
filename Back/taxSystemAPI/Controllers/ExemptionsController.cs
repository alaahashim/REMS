using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/exemptions")]
    public class ExemptionsController : ControllerBase
    {
        private readonly IExemptionService _service;

        public ExemptionsController(IServiceManager serviceManager)
        {
            _service = serviceManager.ExemptionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateExemptionDto dto, IFormFile? file)
        {
            var userId = int.Parse(User.FindFirst("id")?.Value ?? "0");

            AttachmentDto? attachment = null;

            if (file != null && file.Length > 0)
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                attachment = new AttachmentDto
                {
                    Content = ms.ToArray(),
                    FileName = file.FileName,
                    ContentType = file.ContentType
                };
            }

            var id = await _service.CreateAsync(dto, userId, attachment);

            return Ok(new
            {
                success = true,
                exemptionId = id
            });
        }

        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateExemptionDto dto, IFormFile? file)
        {
            AttachmentDto? attachment = null;

            if (file != null && file.Length > 0)
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);

                attachment = new AttachmentDto
                {
                    Content = ms.ToArray(),
                    FileName = file.FileName,
                    ContentType = file.ContentType
                };
            }

            var updated = await _service.UpdateAsync(id, dto, attachment);

            if (!updated)
                return NotFound();

            return Ok(new
            {
                success = true,
                message = "Updated successfully"
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return Ok(new
            {
                success = true,
                message = "Deleted successfully"
            });
        }
         
    }
}