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
    var propertyRepo = unitOfWork.GetRepository<Property, int>();
    var unitRepo = unitOfWork.GetRepository<Unit, int>();
    var property = mapper.Map<Property>(dto);

    

    await propertyRepo.AddAsync(property);
    await unitOfWork.SaveChangesAsync();

    foreach (var unitDto in dto.Units)
{
    var unit = mapper.Map<Unit>(unitDto);

    unit.PropertyId = property.Id;

    unit.UnitNumber = string.IsNullOrWhiteSpace(unit.UnitNumber)
        ? $"U-{Guid.NewGuid().ToString()[..6]}"
        : unit.UnitNumber;

    unit.Status = string.IsNullOrWhiteSpace(unit.Status)
        ? "Available"
        : unit.Status;

    unit.FinishingType = string.IsNullOrWhiteSpace(unit.FinishingType)
        ? "Standard"
        : unit.FinishingType;

    await unitRepo.AddAsync(unit);
}
foreach (var u in dto.Units)
{
    Console.WriteLine($"DTO UnitNumber = {u.UnitNumber}");
}
    await unitOfWork.SaveChangesAsync();

    return property.Id;
}
       public async Task AddUnitAsync(UnitDto dto)
{
    var repo = unitOfWork.GetRepository<Unit, int>();

    var unit = mapper.Map<Unit>(dto);

unit.Status = string.IsNullOrEmpty(unit.Status)
    ? "Available"
    : unit.Status;
unit.UnitNumber =string.IsNullOrWhiteSpace(unit.UnitNumber)? $"U-{Guid.NewGuid().ToString()[..6]}"
        : unit.UnitNumber;

    await repo.AddAsync(unit);
    await unitOfWork.SaveChangesAsync();
} 
        public async Task<IEnumerable<PropertyDto>> GetPropertiesAsync()
{
    var repo = unitOfWork.GetRepository<Property, int>();

    var spec = new PropertyWithUnitsSpec();

    var properties = await repo.GetAllAsync(spec);

    return mapper.Map<IEnumerable<PropertyDto>>(properties);
}


      public async Task<PropertyDto?> GetPropertyByIdAsync(int propertyId)
{
    var repo = unitOfWork.GetRepository<Property, int>();

    var spec = new PropertyWithUnitsSpec(propertyId);

    var property = await repo.GetByIdAsync(spec);

    return property is null ? null : mapper.Map<PropertyDto>(property);
}


       public async Task<IEnumerable<UnitDto>> GetUnitsAsync(int? propertyId)
{
    var repo = unitOfWork.GetRepository<Unit, int>();

    var units = await repo.GetAllAsync();

    if (propertyId.HasValue)
        units = units.Where(x => x.PropertyId == propertyId.Value).ToList();

    return mapper.Map<IEnumerable<UnitDto>>(units);
}



        public async Task UpdatePropertyAsync( int id,UpdatePropertyDto dto)
        {
            var repo =  unitOfWork.GetRepository<Property, int>();

            var property = await repo.GetByIdAsync(id);

            if (property is null)
                return;

            mapper.Map(dto, property);

            repo.Update(property);

            await unitOfWork.SaveChangesAsync();
        }

        public async Task UpdatePropertyStatusAsync( int id, string status)
        {
            var repo = unitOfWork.GetRepository<Property, int>();

            var property =await repo.GetByIdAsync(id);

            if (property is null)
                return;


            repo.Update(property);

            await unitOfWork.SaveChangesAsync();
        }
public async Task UpdateUnitStatusAsync( int unitId,string status)
{
    var repo = unitOfWork.GetRepository<Unit, int>();
    var unit = await repo.GetByIdAsync(unitId);

    if (unit is null)
        return;
    unit.Status = status;
    repo.Update(unit);
    await unitOfWork.SaveChangesAsync();
}
        public async Task DeletePropertyAsync(
            int propertyId)
        {
            var propertyRepo = unitOfWork.GetRepository<Property, int>();

            var unitRepo = unitOfWork.GetRepository<Unit, int>();

            var assignmentRepo =unitOfWork.GetRepository<RoleAssignment,int>();

            var property =await propertyRepo .GetByIdAsync(propertyId);

            if (property is null)
             return;

var assignments = await assignmentRepo.GetAllAsync();

foreach(var item in assignments.Where(x => x.Unit.PropertyId == propertyId))
{
    assignmentRepo.Remove(item);
}
      

            var units =await unitRepo.GetAllAsync();

            foreach (var unit in units.Where(x => x.PropertyId == propertyId))
            {
                unitRepo.Remove(unit);
            }

            propertyRepo.Remove(property);

            await unitOfWork.SaveChangesAsync();
        }

public async Task UpdateUnitAsync(int unitId, UnitDto dto)
{
    var repo = unitOfWork.GetRepository<Unit, int>();

    var unit = await repo.GetByIdAsync(unitId);

    if (unit is null) return;

    mapper.Map(dto, unit);

    repo.Update(unit);
    await unitOfWork.SaveChangesAsync();
}

        public async Task DeleteUnitAsync( int unitId)
        {
            var repo =unitOfWork.GetRepository<Unit, int>();

            var unit = await repo.GetByIdAsync(unitId);

            if (unit is null)
                return;

            repo.Remove(unit);

            await unitOfWork.SaveChangesAsync();
        }
    


    ////////////////
    public async Task<IEnumerable<PropertyWithUnitsDto>> GetPropertiesWithUnitsAsync()
{
    var repo = unitOfWork.GetRepository<Property, int>();

    var spec = new PropertyWithUnitsSpec();

    var data = await repo.GetAllAsync(spec);

    return mapper.Map<IEnumerable<PropertyWithUnitsDto>>(data);
}
}
}