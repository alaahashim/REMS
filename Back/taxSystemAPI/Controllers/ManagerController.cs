using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;
using System.Security.Claims;

namespace Presentation.Controllers;

[ApiController]
[Route("api/manager")]
public class ManagerController : ControllerBase
{
    private readonly IServiceManager _service;

    public ManagerController(IServiceManager service)
    {
        _service = service;
    }

    //-------------------------------------------------
    // Appeals
    //-------------------------------------------------

    [HttpGet("appeals")]
    public async Task<IActionResult> GetAppeals()
    {
        var result =
            await _service.AppealService
                .GetManagerAppealsAsync();

        return Ok(result);
    }

    [HttpPost("appeals/{id}/decision")]
  public async Task<IActionResult> AppealDecision(int id, [FromBody] ManagerDecisionDto dto)

    {
        var managerId = GetCurrentUserId();

        await _service.AppealService
            .ManagerDecisionAsync(
                id,
                dto,
                managerId);

        return Ok(new
        {
            message = "تم اعتماد قرار المدير بنجاح."
        });
    }

    //-------------------------------------------------
    // Exemptions
    //-------------------------------------------------

    [HttpGet("exemptions")]
    public async Task<IActionResult> GetExemptions()
    {
        var result =
            await _service.ExemptionService
                .GetManagerExemptionsAsync();

        return Ok(result);
    }

    [HttpPost("exemptions/{id}/decision")]
   public async Task<IActionResult> ExemptionDecision(int id, [FromBody] ManagerExemptionDecisionDto dto)

    {
        var managerId = GetCurrentUserId();

        await _service.ExemptionService
            .ManagerDecisionAsync(
                id,
                dto,
                managerId);

        return Ok(new
        {
            message = "تم اعتماد قرار المدير بنجاح."
        });
    }

    //-------------------------------------------------
    // Helper
    //-------------------------------------------------

    private int GetCurrentUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(id))
            return 0;

        return int.Parse(id);
    }
}