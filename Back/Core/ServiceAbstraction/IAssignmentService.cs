using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface IAssignmentService
    {
        Task<IEnumerable<AssignmentDto>>
            GetAssignmentsAsync();

        Task<AssignmentDto?>
            GetAssignmentByPersonIdAsync(string personId);

        Task<int>
            CreateAssignmentAsync(CreateAssignmentDto dto);

        Task UpdateAssignmentAsync(
            int assignmentId,
            CreateAssignmentDto dto);

        Task DeleteAssignmentAsync(int assignmentId);
    }
}