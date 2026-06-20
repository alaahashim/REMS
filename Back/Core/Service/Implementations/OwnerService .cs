using AutoMapper;
using Core.DomainLayer.Contracts;
using Shared.DTOS;
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
}