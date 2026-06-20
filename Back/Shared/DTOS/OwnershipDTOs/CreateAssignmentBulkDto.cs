namespace Shared.DTOS;
public class CreateAssignmentBulkDto
{
    public List<CreateAssignmentDto> Items { get; set; } = new();
}