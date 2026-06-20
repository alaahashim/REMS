using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOS;

[ApiController]
[Route("api/assignments")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _service;

    public AssignmentsController(IServiceManager serviceManager)
    {
        _service = serviceManager.AssignmentService;
    }

    // GET api/assignments
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // GET api/assignments/person/{nationalId}
    [HttpGet("person/{nationalId}")]
    public async Task<IActionResult> GetByPerson(string nationalId)
    {
        var result = await _service.GetByPersonIdAsync(nationalId);
        return Ok(result);
    }

    // GET api/assignments/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        return Ok(new
        {
            message = $"Assignment {id}"
        });
    }

    // POST api/assignments/bulk
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulk(
        [FromBody] List<CreateAssignmentDto> dto)
    {
        await _service.CreateBulkAsync(dto);

        return Ok(new
        {
            success = true,
            message = "Assignments created successfully"
        });
    }

    // PUT api/assignments/{id}
    [HttpPut("{id}")]
    public IActionResult Update(int id)
    {
        return Ok(new
        {
            success = true,
            message = $"Assignment {id} updated"
        });
    }

    // DELETE api/assignments/{id}
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        return Ok(new
        {
            success = true,
            message = $"Assignment {id} deleted"
        });
    }
}