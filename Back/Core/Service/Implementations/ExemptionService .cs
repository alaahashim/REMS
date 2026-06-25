using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.DomainLayer.Exceptions;
using Core.ServiceAbstraction;
using Core.Service.Specifications;
using Shared.DTOS;

public class ExemptionService : IExemptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ExemptionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<int> CreateAsync(CreateExemptionDto dto, int userId, AttachmentDto? attachment)
    {
        var repo = _unitOfWork.GetRepository<Exemption, int>();

        if (dto == null)
            throw new ValidationException(new List<string> { "Request data is required" });

        var entity = _mapper.Map<Exemption>(dto);

        entity.CreatedBy = userId;
        entity.CreatedAt = DateTime.UtcNow;
        entity.Status = WorkflowStatus.Pending;

        if (attachment != null && attachment.Content.Length > 0)
        {
            entity.Attachments.Add(await SaveAttachmentAsync(attachment));
        }

        await repo.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return entity.Id;
    }
public async Task<IEnumerable<RequestHomeDto>> GetHomeRequestsAsync()
{
    var repo = _unitOfWork.GetRepository<Exemption, int>();

    var spec = new ExemptionHomeSpec();
    var data = await repo.GetAllAsync(spec);

    if (data == null || !data.Any())
        return Enumerable.Empty<RequestHomeDto>();

    return _mapper.Map<IEnumerable<RequestHomeDto>>(data);
}
   public async Task<IEnumerable<ExemptionDto>> GetAllAsync()
    {
        var repo = _unitOfWork.GetRepository<Exemption, int>();

        var data = await repo.GetAllAsync();

        if (data == null || !data.Any())
            throw new NotFoundException("No exemptions found");

        return _mapper.Map<IEnumerable<ExemptionDto>>(data);
    }

    public async Task<ExemptionDetailsDto?> GetByIdAsync(int id)
    {
        var repo = _unitOfWork.GetRepository<Exemption, int>();

        var entity = await repo.GetByIdAsync(id);

        if (entity == null)
            throw new NotFoundException($"Exemption with id {id} not found");

        return _mapper.Map<ExemptionDetailsDto>(entity);
    }

    public async Task<bool> UpdateAsync(int id, UpdateExemptionDto dto, AttachmentDto? attachment)
    {
        var repo = _unitOfWork.GetRepository<Exemption, int>();

        var entity = await repo.GetByIdAsync(id);

        if (entity == null)
            throw new NotFoundException($"Exemption with id {id} not found");

        if (dto == null)
            throw new ValidationException(new List<string> { "Update data is required" });

        _mapper.Map(dto, entity);

        entity.UpdatedAt = DateTime.UtcNow;

        if (attachment != null && attachment.Content.Length > 0)
        {
            entity.Attachments.Add(await SaveAttachmentAsync(attachment));
        }

        repo.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var repo = _unitOfWork.GetRepository<Exemption, int>();

        var entity = await repo.GetByIdAsync(id);

        if (entity == null)
            throw new NotFoundException($"Exemption with id {id} not found");

        repo.Remove(entity);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    // ===========================
    // File Saving (no ASP.NET dependency)
    // ===========================
    private async Task<ExemptionAttachment> SaveAttachmentAsync(AttachmentDto file)
    {
        var uploadsRoot = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "exemptions"
        );

        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var fullPath = Path.Combine(uploadsRoot, fileName);

        await File.WriteAllBytesAsync(fullPath, file.Content);

        return new ExemptionAttachment
        {
            DocumentType = file.ContentType,
            FilePath = Path.Combine("uploads", "exemptions", fileName)
                .Replace("\\", "/")
        };
    }

public async Task<TaxExemptionCheckResultDto> CheckTaxExemptionAsync(
    int ownerId,
    int unitId,
    int taxYear,
    decimal netAnnualRentalValue)
{
    // ── حد الإعفاء — القانون 196 / 2008 بتعديل 2023 ──────────
    // الوحدة السكنية الأساسية معفاة إعفاءً كاملاً إذا كان
    // صافي القيمة الإيجارية السنوية ≤ 24,000 ج.م
    // هذا الفحص يجري بالفعل في TaxAssessmentService قبل استدعاء هذه الميثود
    // لكن نتحقق مرة أخرى للأمان

    if (netAnnualRentalValue > 24_000m)
    {
        return new TaxExemptionCheckResultDto
        {
            IsExempted      = false,
            ExemptionAmount = 0m,
            ExemptionReason = "صافي القيمة الإيجارية يتجاوز حد الإعفاء (24,000 ج.م)"
        };
    }

    var repo = _unitOfWork.GetRepository<Exemption, int>();
    var allOwnerExemptions = await repo.GetAllAsync();

    // الإعفاءات المعتمدة لهذا المالك من نوع السكن الأساسي فقط
    var primaryHomeExemptions = allOwnerExemptions
        .Where(x =>
            x.OwnerId == ownerId &&
            x.Status  == WorkflowStatus.Approved &&
            IsPrimaryHomeType(x.ExemptionType))
        .OrderBy(x => x.ExemptionDate)
        .ToList();

    // لا يوجد إعفاء مسجل لهذا المالك
    if (!primaryHomeExemptions.Any())
    {
        return new TaxExemptionCheckResultDto
        {
            IsExempted      = false,
            ExemptionAmount = 0m,
            ExemptionReason = null
        };
    }

    // المالك له إعفاء واحد فقط للسكن الأساسي — نأخذ الأقدم
    var approvedExemption = primaryHomeExemptions.First();

    // الإعفاء مسجل على وحدة أخرى
    if (approvedExemption.UnitId != unitId)
    {
        return new TaxExemptionCheckResultDto
        {
            IsExempted      = false,
            ExemptionAmount = 0m,
            ExemptionReason = "الإعفاء الأساسي مُستخدم على وحدة أخرى"
        };
    }

    // إعفاء كامل من صافي القيمة الإيجارية
    return new TaxExemptionCheckResultDto
    {
        IsExempted      = true,
        ExemptionAmount = netAnnualRentalValue,
        ExemptionReason = "وحدة سكنية أساسية — إعفاء كامل (م. 18 ق. 196/2008)"
    };
}

// ── Helper داخلي ────────────────────────────────────────────────
private static bool IsPrimaryHomeType(string? type)
{
    if (string.IsNullOrWhiteSpace(type)) return false;

    return type.Trim().ToLowerInvariant() is
        "primaryhome"  or
        "primary_home" or
        "سكن رئيسي"   or
        "مسكن رئيسي"  or
        "الوحدة السكنية الأساسية";
}
}