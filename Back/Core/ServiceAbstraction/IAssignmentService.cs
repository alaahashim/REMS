using Shared.DTOS;

public interface IAssignmentService
{
    Task<List<AssignmentDto>> GetAllAsync();
    Task<List<AssignmentDto>> GetByPersonIdAsync(string nationalId);
    Task CreateBulkAsync(List<CreateAssignmentDto> dto);
}