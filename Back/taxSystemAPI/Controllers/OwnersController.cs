using System;
using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

namespace Presentation.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OwnersController(
    IServiceManager service)
    : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult>
        GetOwners()
    {
        var result =
            await service
            .OwnerService
            .GetOwnersAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult>
        GetOwner(int id)
    {
        var result =
            await service
            .OwnerService
            .GetOwnerByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult>
        CreateOwner(
        [FromBody]
        CreateOwnerDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var id =
                await service
                .OwnerService
                .CreateOwnerAsync(dto);

            return Ok(new
            {
                Success = true,
                OwnerId = id
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Success = false,
                Message = ex.Message
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult>
        UpdateOwner(
        int id,
        [FromBody]
        UpdateOwnerDto dto)
    {
        await service
            .OwnerService
            .UpdateOwnerAsync(id, dto);

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult>
        DeleteOwner(int id)
    {
        await service
            .OwnerService
            .DeleteOwnerAsync(id);

        return Ok();
    }
}