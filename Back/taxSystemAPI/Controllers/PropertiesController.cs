using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Presentation.Controllers
{
   [ApiController]
[Route("api/[controller]")]
public class PropertiesController(IServiceManager service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> AddProperty([FromBody] CreatePropertyWithUnitsDto dto)
    {
        var id = await service.PropertyService.AddPropertyAsync(dto);

        return Ok(new
        {
            success = true,
            propertyId = id
        });
    }

    [HttpGet]
    public async Task<IActionResult> GetProperties()
        => Ok(await service.PropertyService.GetPropertiesAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPropertyById(int id)
    {
        var result = await service.PropertyService.GetPropertyByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpGet("units")]
    public async Task<IActionResult> GetUnits([FromQuery] int? propertyId)
        => Ok(await service.PropertyService.GetUnitsAsync(propertyId));

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProperty(int id, UpdatePropertyDto dto)
    {
        await service.PropertyService.UpdatePropertyAsync(id, dto);
        return Ok(new { success = true });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        await service.PropertyService.UpdatePropertyStatusAsync(id, status);
        return Ok(new { success = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProperty(int id)
    {
        await service.PropertyService.DeletePropertyAsync(id);
        return Ok(new { success = true });
    }

    [HttpPut("unit/{unitId}")]
    public async Task<IActionResult> UpdateUnit(int unitId, UnitDto dto)
    {
        await service.PropertyService.UpdateUnitAsync(unitId, dto);
        return Ok(new { success = true });
    }

    [HttpDelete("unit/{unitId}")]
    public async Task<IActionResult> DeleteUnit(int unitId)
    {
        await service.PropertyService.DeleteUnitAsync(unitId);
        return Ok(new { success = true });
    }
}
}