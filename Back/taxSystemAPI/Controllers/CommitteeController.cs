using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

[ApiController]
[Route("api/committee")]
public class CommitteeController : ControllerBase
{
    private readonly IServiceManager _service;

    public CommitteeController(IServiceManager service)
    {
        _service = service;
    }

    [HttpGet("appeals")]
    public async Task<IActionResult> GetAppeals()
    {
        var result =
            await _service.AppealService
                .GetCommitteeAppealsAsync();

        return Ok(result);
    }

  [HttpPut("appeals/{id}/decision")]
public async Task<IActionResult> AppealDecision(int id,[FromBody] CommitteeDecisionDto dto)
{
    var committeeUserId = 1;

    await _service.AppealService
        .CommitteeDecisionAsync(
            id,
            dto,
            committeeUserId);

    return Ok(new
    {
        success = true
    });
}

    [HttpGet("exemptions")]
    public async Task<IActionResult> GetExemptions()
    {
        var result =
            await _service.ExemptionService
                .GetCommitteeExemptionsAsync();

        return Ok(result);
    }

  [HttpPut("exemptions/{id}/decision")]
public async Task<IActionResult> ExemptionDecision(
    int id,
    [FromBody] CommitteeDecisionDto dto)
{
    var committeeUserId = 1;

    await _service.ExemptionService
        .CommitteeDecisionAsync(
            id,
            dto,
            committeeUserId);

    return Ok(new
    {
        success = true
    });
}
}