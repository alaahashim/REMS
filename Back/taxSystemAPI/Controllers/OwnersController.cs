using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OwnersController(IServiceManager service) : ControllerBase
    {
        // GET: api/owners?search=ahmed
        [HttpGet]
        public async Task<IActionResult> GetOwners([FromQuery] string? search)
        {
            var result = await service.OwnerService.GetAllAsync(search);
            return Ok(result);
        }

        // GET: api/owners/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOwnerById(int id)
        {
            var result = await service.OwnerService.GetByIdAsync(id);
            if (result is null) return NotFound();
            return Ok(result);
        }

        // GET: api/owners/{id}/units
        [HttpGet("{id}/units")]
        public async Task<IActionResult> GetOwnerUnits(int id)
        {
            var result = await service.OwnerService.GetUnitsByOwnerIdAsync(id);
            return Ok(result);
        }

        // GET: api/owners/{id}/units/edit
        [HttpGet("{id}/units/edit")]
        public async Task<IActionResult> GetOwnerUnitsForEdit(int id)
        {
            var result = await service.OwnerService.GetUnitsForEditAsync(id);
            return Ok(result);
        }

        // POST: api/owners
        [HttpPost]
        public async Task<IActionResult> AddOwner([FromBody] CreateOwnerDto dto)
        {
            var id = await service.OwnerService.CreateAsync(dto);
            return Ok(new { success = true, ownerId = id });
        }

        // PUT: api/owners/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOwner(int id, [FromBody] UpdateOwnerDto dto)
        {
            await service.OwnerService.UpdateAsync(id, dto);
            return Ok(new { success = true });
        }

        // DELETE: api/owners/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOwner(int id)
        {
            await service.OwnerService.DeleteAsync(id);
            return Ok(new { success = true });
        }

        // GET: api/owners/by-national-id/{nationalId}
        [HttpGet("by-national-id/{nationalId}")]
        public async Task<IActionResult> GetByNationalId(string nationalId)
        {
            var owner = await service.OwnerService.GetByNationalIdAsync(nationalId);
            if (owner == null) return NotFound(new { message = "Owner not found" });
            return Ok(owner);
        }
    }
}