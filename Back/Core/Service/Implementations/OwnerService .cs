using AutoMapper;
using Core.DomainLayer.Contracts;
using Shared.DTOS;
using Core.Service.Specifications;
using static Core.Service.Specifications.AssignmentsByOwnerIdSpec;
namespace Core.Service.Implementations;
public class OwnerService : IOwnerService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    public OwnerService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }
    // ─────────────────────────────
    // GET ALL + SEARCH
    // ─────────────────────────────
    public async Task<IEnumerable<OwnerDto>> GetAllAsync(string? search)
    {
        var repo = _unitOfWork.GetRepository<Owner, int>();

        var owners = await repo.GetAllAsync();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.ToLower();

            owners = owners.Where(x =>
                x.FullName.ToLower().Contains(search) ||
                x.NationalId.Contains(search) ||
                x.Phone.Contains(search)
            );
        }

        return _mapper.Map<IEnumerable<OwnerDto>>(owners);
    }

    // ─────────────────────────────
    // GET BY ID
    // ─────────────────────────────
    public async Task<OwnerDto> GetByIdAsync(int id)
    {
        var repo = _unitOfWork.GetRepository<Owner, int>();

        var owner = await repo.GetByIdAsync(id);

        if (owner == null)
            throw new Exception("Owner not found");

        return _mapper.Map<OwnerDto>(owner);
    }

    // ─────────────────────────────
    // CREATE OWNER
    // ─────────────────────────────
    public async Task<int> CreateAsync(CreateOwnerDto dto)
    {
        var repo = _unitOfWork.GetRepository<Owner, int>();

        // validation بسيط
        if (string.IsNullOrWhiteSpace(dto.NationalId))
            throw new Exception("NationalId required");

        var existing = (await repo.GetAllAsync())
            .FirstOrDefault(x => x.NationalId == dto.NationalId);

        if (existing != null)
            throw new Exception("Owner already exists");

        var owner = new Owner
        {
            NationalId = dto.NationalId,
            FullName = dto.FullName,
            Phone = dto.Phone,
            Address = dto.Address,
            OwnerType = dto.OwnerType,
            IsActive = true
        };

        await repo.AddAsync(owner);
        await _unitOfWork.SaveChangesAsync();
        return owner.Id;
       
    }

 public async Task<IEnumerable<OwnerUnitDto>> GetUnitsByOwnerIdAsync(int ownerId)
{
    var assignmentRepo = _unitOfWork.GetRepository<RoleAssignment, int>();
    var spec           = new AssignmentsByOwnerIdWithAddressSpec(ownerId);
    var assignments    = await assignmentRepo.GetAllAsync(spec);

    return assignments
        .Where(a => a.Unit != null)
        .Select(a =>
        {
            var prop = a.Unit!.Property;
string address = "-";

if (prop != null)
{
    var gov   = prop.Governorate?.Name  ?? "";
    var neigh = prop.Neighborhood?.Name ?? "";
    var bldg  = prop.BuildingNo         ?? "";

    var parts = new[] { gov, neigh }
        .Where(s => !string.IsNullOrWhiteSpace(s))
        .ToList();

    address = parts.Any()
        ? string.Join(" - ", parts) + (string.IsNullOrWhiteSpace(bldg) ? "" : $" - مبنى {bldg}")
        : "-";
}

            return new OwnerUnitDto
            {  AssignmentId = a.Id,  
                UnitId     = a.Unit!.Id,
                UnitNumber = a.Unit.UnitNumber,
                Area       = a.Unit.Area,
                StartDate  = a.StartDate,
                Address    = address
            };
        })
        .ToList();
}
    // ─────────────────────────────
    // GET BY NATIONAL ID
    // ─────────────────────────────
   public async Task<OwnerDto?> GetByNationalIdAsync(string nationalId)
{
    var assignmentRepo =
        _unitOfWork.GetRepository<RoleAssignment, int>();

    var spec =
        new AssignmentsByNationalIdSpec(nationalId);

    var assignments =
        await assignmentRepo.GetAllAsync(spec);

    if (!assignments.Any())
        return null;

    var owner =
        assignments.First().Owner;

    var ownerDto =
        _mapper.Map<OwnerDto>(owner);

    ownerDto.Units =
        assignments
        .Where(a => a.Unit != null)
        .Select(a => new UnitDto
        {
            Id = a.Unit!.Id,
            UnitNumber = a.Unit.UnitNumber,
             Floor = a.Unit.Floor,
        Area = a.Unit.Area,
        UsageType = a.Unit.UsageType
        })
        .ToList();

    return ownerDto;
}

// ─────────────────────────────
// UPDATE OWNER (Phone + Address فقط)
// ─────────────────────────────
public async Task UpdateAsync(int id, UpdateOwnerDto dto)
{
    var repo  = _unitOfWork.GetRepository<Owner, int>();
    var owner = await repo.GetByIdAsync(id);

    if (owner is null)
        throw new Exception("المالك غير موجود");

    owner.Phone   = dto.Phone.Trim();
    owner.Address = dto.Address.Trim();

    repo.Update(owner);
    await _unitOfWork.SaveChangesAsync();
}

// ─────────────────────────────
// DELETE OWNER
// ─────────────────────────────
public async Task DeleteAsync(int id)
{
    var repo  = _unitOfWork.GetRepository<Owner, int>();
    var owner = await repo.GetByIdAsync(id);

    if (owner is null)
        throw new Exception("المالك غير موجود");

    repo.Remove(owner);
    await _unitOfWork.SaveChangesAsync();
}

// ─────────────────────────────
// GET UNITS FOR EDIT (مع AssignmentId و EndDate و UsageType)
// ─────────────────────────────
public async Task<IEnumerable<OwnerUnitEditDto>> GetUnitsForEditAsync(int ownerId)
{
    var assignmentRepo = _unitOfWork.GetRepository<RoleAssignment, int>();
    var spec           = new AssignmentsByOwnerIdWithAddressSpec(ownerId);
    var assignments    = await assignmentRepo.GetAllAsync(spec);

    return assignments
        .Where(a => a.Unit != null)
        .Select(a =>
        {
            var prop = a.Unit!.Property;
string address = "-";

if (prop != null)
{
    var gov   = prop.Governorate?.Name  ?? "";
    var neigh = prop.Neighborhood?.Name ?? "";
    var bldg  = prop.BuildingNo         ?? "";

    var parts = new[] { gov, neigh }
        .Where(s => !string.IsNullOrWhiteSpace(s))
        .ToList();

    address = parts.Any()
        ? string.Join(" - ", parts) + (string.IsNullOrWhiteSpace(bldg) ? "" : $" - مبنى {bldg}")
        : "-";
}
            return new OwnerUnitEditDto
            {
                AssignmentId = a.Id,
                UnitId       = a.Unit!.Id,
                UnitNumber   = a.Unit.UnitNumber,
                Area         = a.Unit.Area,
                UsageType    = a.Unit.UsageType ?? "",
                StartDate    = a.StartDate,
                EndDate      = a.EndDate,
                Address      = address
            };
        })
        .ToList();
}


}