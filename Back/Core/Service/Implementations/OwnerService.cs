using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class OwnerService(
        IUnitOfWork unitOfWork,
        IMapper mapper)
        : IOwnerService
    {
        public async Task<IEnumerable<OwnerDto>>
            GetOwnersAsync()
        {
            var repo =
                unitOfWork
                .GetRepository<Owner, int>();

            var owners =
                await repo.GetAllAsync();

            return mapper.Map<
                IEnumerable<OwnerDto>>
                (owners);
        }

        public async Task<OwnerDto?>
            GetOwnerByIdAsync(
            int id)
        {
            var repo =
                unitOfWork
                .GetRepository<Owner, int>();

            var owner =
                await repo.GetByIdAsync(id);

            return owner is null
                ? null
                : mapper.Map<OwnerDto>(
                    owner);
        }

        public async Task<int>
            CreateOwnerAsync(
            CreateOwnerDto dto)
        {
            var repo =
                unitOfWork
                .GetRepository<Owner, int>();

            var owner =
                mapper.Map<Owner>(dto);

            owner.IsActive = true;

            await repo.AddAsync(owner);

            await unitOfWork
                .SaveChangesAsync();

            return owner.Id;
        }

        public async Task
            UpdateOwnerAsync(
            int id,
            UpdateOwnerDto dto)
        {
            var repo =
                unitOfWork
                .GetRepository<Owner, int>();

            var owner =
                await repo.GetByIdAsync(id);

            if (owner is null)
                return;

            mapper.Map(
                dto,
                owner);

            repo.Update(owner);

            await unitOfWork
                .SaveChangesAsync();
        }

        public async Task
            DeleteOwnerAsync(
            int id)
        {
            var repo =
                unitOfWork
                .GetRepository<Owner, int>();

            var owner =
                await repo.GetByIdAsync(id);

            if (owner is null)
                return;

            repo.Remove(owner);

            await unitOfWork
                .SaveChangesAsync();
        }
    }
}