using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class PropertyService(
        IUnitOfWork unitOfWork,
        IMapper mapper) : IPropertyService
    {
        public async Task<int> AddPropertyAsync(
    CreatePropertyWithUnitsDto dto)
{
    var propertyRepo =
        unitOfWork.GetRepository<Property, int>();

    var unitRepo =
        unitOfWork.GetRepository<Unit, int>();

    var ownerRepo =
        unitOfWork.GetRepository<Owner, int>();

    var assignmentRepo =
        unitOfWork.GetRepository<RoleAssignment, int>();


    // =========================
    // Create Property
    // =========================

    var property =
        mapper.Map<Property>(dto);

    await propertyRepo.AddAsync(property);

    await unitOfWork.SaveChangesAsync();


    // =========================
    // Create Units
    // =========================

    foreach (var unitDto in dto.Units)
    {
        var unit =
            mapper.Map<Unit>(unitDto);

        unit.PropertyId =
            property.Id;

        await unitRepo.AddAsync(unit);
    }

    await unitOfWork.SaveChangesAsync();


    // =========================
    // Auto Create Owner
    // =========================

    if (!string.IsNullOrWhiteSpace(dto.OwnerName)
        &&
        !string.IsNullOrWhiteSpace(dto.OwnerNationalId))
    {
        var owners =
            await ownerRepo.GetAllAsync();

        var owner =
            owners.FirstOrDefault(x =>
                x.NationalId ==
                dto.OwnerNationalId);

        if (owner is null)
        {
            owner = new Owner
            {
                FullName = dto.OwnerName,
                NationalId = dto.OwnerNationalId,
                IsActive = true,
                OwnerType = "Individual"
            };

            await ownerRepo.AddAsync(owner);

            await unitOfWork.SaveChangesAsync();
        }


        // =========================
        // Auto Assignment
        // =========================

        var assignment =
            new RoleAssignment
            {
                OwnerId = owner.Id,

                PropertyId =
                    property.Id,

                UnitId = null,

                RoleType = "Owner",

                ShareType = "Full",

                SharePercentage = 100,

                StartDate =
                    DateOnly.FromDateTime(
                        DateTime.UtcNow),

                IsActive = true
            };

        await assignmentRepo
            .AddAsync(assignment);

        await unitOfWork.SaveChangesAsync();
    }

    return property.Id;
}
        public async Task AddUnitAsync(UnitDto dto)
        {
            var repo =
                unitOfWork.GetRepository<Unit, int>();

            var unit =
                mapper.Map<Unit>(dto);

            await repo.AddAsync(unit);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<PropertyDto>>
            GetPropertiesAsync()
        {
            var repo =
                unitOfWork.GetRepository<Property, int>();

            var properties =
                await repo.GetAllAsync();

            return mapper.Map<
                IEnumerable<PropertyDto>>
                (properties);
        }

        public async Task<PropertyDto?>
            GetPropertyByIdAsync(int propertyId)
        {
            var repo =
                unitOfWork.GetRepository<Property, int>();

            var property =
                await repo.GetByIdAsync(propertyId);

            return property is null
                ? null
                : mapper.Map<PropertyDto>(property);
        }

        public async Task<IEnumerable<UnitDto>>
            GetUnitsAsync(int? propertyId)
        {
            var repo =
                unitOfWork.GetRepository<Unit, int>();

            var units =
                await repo.GetAllAsync();

            if (propertyId.HasValue)
            {
                units = units
                    .Where(x =>
                        x.PropertyId ==
                        propertyId.Value)
                    .ToList();
            }

            return mapper.Map<
                IEnumerable<UnitDto>>
                (units);
        }

        public async Task UpdatePropertyAsync(
            int id,
            UpdatePropertyDto dto)
        {
            var repo =
                unitOfWork.GetRepository<Property, int>();

            var property =
                await repo.GetByIdAsync(id);

            if (property is null)
                return;

            mapper.Map(dto, property);

            repo.Update(property);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task UpdatePropertyStatusAsync(
            int id,
            string status)
        {
            var repo =
                unitOfWork.GetRepository<Property, int>();

            var property =
                await repo.GetByIdAsync(id);

            if (property is null)
                return;

            property.Status = status;

            repo.Update(property);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task DeletePropertyAsync(
            int propertyId)
        {
            var propertyRepo =
                unitOfWork.GetRepository<Property, int>();

            var unitRepo =
                unitOfWork.GetRepository<Unit, int>();

            var assignmentRepo =
                unitOfWork.GetRepository<RoleAssignment, int>();

            var property =
                await propertyRepo
                    .GetByIdAsync(propertyId);

            if (property is null)
                return;

            var assignments =
                await assignmentRepo
                    .GetAllAsync();

            foreach (var assignment in assignments
                .Where(x =>
                    x.PropertyId ==
                    propertyId))
            {
                assignmentRepo.Remove(
                    assignment);
            }

            var units =
                await unitRepo.GetAllAsync();

            foreach (var unit in units
                .Where(x =>
                    x.PropertyId ==
                    propertyId))
            {
                unitRepo.Remove(unit);
            }

            propertyRepo.Remove(property);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task UpdateUnitAsync(
            int unitId,
            UnitDto dto)
        {
            var repo =
                unitOfWork.GetRepository<Unit, int>();

            var unit =
                await repo.GetByIdAsync(unitId);

            if (unit is null)
                return;

            mapper.Map(dto, unit);

            repo.Update(unit);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteUnitAsync(
            int unitId)
        {
            var repo =
                unitOfWork.GetRepository<Unit, int>();

            var unit =
                await repo.GetByIdAsync(unitId);

            if (unit is null)
                return;

            repo.Remove(unit);

            await unitOfWork.SaveChangesAsync();
        }
    }
}