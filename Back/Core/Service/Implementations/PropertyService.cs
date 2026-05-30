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
        public async Task<int> AddPropertyAsync(CreatePropertyWithUnitsDto dto)
        {
            var propertyRepo =
                unitOfWork.GetRepository<Property, int>();

            var unitRepo =
                unitOfWork.GetRepository<Unit, int>();

            // 1- Add Property
            var property =
                mapper.Map<Property>(dto.Property);

            await propertyRepo.AddAsync(property);
            await unitOfWork.SaveChangesAsync();

            // 2- Add Units
            foreach (var unitDto in dto.Units)
            {
                var unit = mapper.Map<Unit>(unitDto);

                unit.PropertyId = property.Id;

                await unitRepo.AddAsync(unit);
            }

            await unitOfWork.SaveChangesAsync();

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

        public async Task<IEnumerable<PropertyDto>> GetPropertiesAsync()
        {
            var repo =
                unitOfWork.GetRepository<Property, int>();

            var data = await repo.GetAllAsync();

            return mapper.Map<IEnumerable<PropertyDto>>(data);
        }

        public async Task<IEnumerable<UnitDto>> GetUnitsAsync(int? propertyId)
        {
            var repo =
                unitOfWork.GetRepository<Unit, int>();

            var data = await repo.GetAllAsync();

            if (propertyId.HasValue)
            {
                data = data
                    .Where(x => x.PropertyId == propertyId.Value)
                    .ToList();
            }

            return mapper.Map<IEnumerable<UnitDto>>(data);
        }

        public async Task DeletePropertyAsync(int propertyId)
        {
            var propertyRepo =
                unitOfWork.GetRepository<Property, int>();

            var unitRepo =
                unitOfWork.GetRepository<Unit, int>();

            var property =
                await propertyRepo.GetByIdAsync(propertyId);

            if (property is null)
                return;

            var units =
                await unitRepo.GetAllAsync();

            var relatedUnits =
                units.Where(x => x.PropertyId == propertyId);

            foreach (var unit in relatedUnits)
            {
                unitRepo.Remove(unit);   // ✅ FIX HERE
            }

            propertyRepo.Remove(property); // ✅ FIX HERE

            await unitOfWork.SaveChangesAsync();
        }

        public async Task UpdatePropertyStatusAsync(int id, string status)
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
    }
}