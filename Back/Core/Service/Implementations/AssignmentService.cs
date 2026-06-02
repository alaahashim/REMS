using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.Service.Specifications;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class AssignmentService( IUnitOfWork unitOfWork, IMapper mapper) : IAssignmentService
    {
        public async Task<IEnumerable<AssignmentDto>>
            GetAssignmentsAsync()
        {
            var repo =
                unitOfWork
                .GetRepository<RoleAssignment, int>();

            var assignments =
                await repo.GetAllAsync(
                    new AssignmentWithOwnerSpecification());

            return mapper.Map<
                IEnumerable<AssignmentDto>>
                (assignments);
        }

        public async Task<AssignmentDto?> GetAssignmentByPersonIdAsync( string personId)
        {
            var repo =
                unitOfWork
                .GetRepository<RoleAssignment, int>();

            var assignment =
                await repo.GetByIdAsync(
                    new AssignmentWithOwnerSpecification(
                        personId));

            return assignment is null
                ? null
                : mapper.Map<AssignmentDto>(
                    assignment);
        }

        public async Task<int> CreateAssignmentAsync( CreateAssignmentDto dto)
        {
            var ownerRepo =
                unitOfWork
                .GetRepository<Owner, int>();

            var assignmentRepo =
                unitOfWork
                .GetRepository<RoleAssignment, int>();

            var owners =
                await ownerRepo.GetAllAsync();

            var owner = owners.FirstOrDefault(x => x.NationalId == dto.PersonId);

            if (owner is null)
            {
                owner = new Owner
                {
                    NationalId = dto.PersonId,
                    FullName = dto.Name,
                    OwnerType = "Individual",
                    IsActive = true
                };

                await ownerRepo.AddAsync(owner);

                await unitOfWork.SaveChangesAsync();
            }

            var assignment = mapper.Map<RoleAssignment>(dto);

            assignment.OwnerId = owner.Id;

            assignment.IsActive = true;

            await assignmentRepo
                .AddAsync(assignment);

            await unitOfWork.SaveChangesAsync();

            return assignment.Id;
        }

        public async Task UpdateAssignmentAsync( int assignmentId, CreateAssignmentDto dto)
        {
            var repo =unitOfWork.GetRepository<RoleAssignment, int>();

            var assignment =  await repo.GetByIdAsync( assignmentId);

            if (assignment is null)
                return;

            mapper.Map(
                dto,
                assignment);

            repo.Update(assignment);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task
            DeleteAssignmentAsync(
            int assignmentId)
        {
            var repo =
                unitOfWork
                .GetRepository<RoleAssignment, int>();

            var assignment =
                await repo.GetByIdAsync(
                    assignmentId);

            if (assignment is null)
                return;

            repo.Remove(assignment);

            await unitOfWork.SaveChangesAsync();
        }
    }
}