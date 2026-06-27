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
        entity.Status = ExemptionStatus.PendingCommittee;

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
            x.Status  == ExemptionStatus.Approved &&
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

#region Committee
public async Task<IEnumerable<CommitteeExemptionDto>> GetCommitteeExemptionsAsync()
{
    var repo =
        _unitOfWork.GetRepository<Exemption, int>();

    var exemptions =
        await repo.GetAllAsync(
            new PendingCommitteeExemptionsSpec());

    return _mapper.Map<IEnumerable<CommitteeExemptionDto>>(exemptions);
}
public async Task CommitteeDecisionAsync(
    int exemptionId,
    CommitteeDecisionDto dto,
    int committeeUserId)
{
    var repo =
        _unitOfWork.GetRepository<Exemption,int>();

    var exemption =
        await repo.GetByIdAsync(exemptionId);

    if (exemption == null)
        throw new NotFoundException("Exemption not found");

    if (exemption.Status != ExemptionStatus.PendingCommittee)
        throw new BusinessException("تمت مراجعة الطلب بالفعل");

    exemption.CommitteeVerdict = dto.Verdict;

    exemption.CommitteeNote = dto.Note;

    exemption.CommitteeDecisionDate = DateTime.UtcNow;

    exemption.CommitteeUserId = committeeUserId;

    exemption.Status =
        ExemptionStatus.PendingManager;

    repo.Update(exemption);

    await _unitOfWork.SaveChangesAsync();
}
#endregion



public async Task<AttachmentDownloadDto?> GetAttachmentAsync(int exemptionId)
{
    var repo = _unitOfWork.GetRepository<Exemption, int>();

    var exemption = (await repo.GetAllAsync(new ExemptionWithAttachmentsSpec(exemptionId)))
        .FirstOrDefault();

    if (exemption == null)
        throw new NotFoundException("طلب الإعفاء غير موجود");

    var attachment = exemption.Attachments.FirstOrDefault();

    if (attachment == null)
        return null;

    var fullPath = Path.Combine(
        Directory.GetCurrentDirectory(),
        "wwwroot",
        attachment.FilePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

    if (!File.Exists(fullPath))
        throw new NotFoundException("الملف غير موجود");

    return new AttachmentDownloadDto
    {
        FullPath = fullPath,
        FileName = Path.GetFileName(fullPath),
        ContentType = GetContentType(fullPath)
    };
}

private static string GetContentType(string path)
{
    var extension = Path.GetExtension(path).ToLower();

    return extension switch
    {
        ".pdf" => "application/pdf",
        ".png" => "image/png",
        ".jpg" => "image/jpeg",
        ".jpeg" => "image/jpeg",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        _ => "application/octet-stream"
    };

}
#region manager
public async Task<IEnumerable<ManagerExemptionDto>>
GetManagerExemptionsAsync()
{
    var repo =
        _unitOfWork.GetRepository<Exemption, int>();

    var exemptions =
        await repo.GetAllAsync(
            new PendingManagerExemptionsSpec());

    return _mapper.Map<IEnumerable<ManagerExemptionDto>>(exemptions);
}



public async Task ManagerDecisionAsync(
    int exemptionId,
    ManagerExemptionDecisionDto dto,
    int managerUserId)
{
    var exemptionRepo =
        _unitOfWork.GetRepository<Exemption, int>();

    var exemption =
        await exemptionRepo.FirstOrDefaultAsync(
            new ExemptionWithAttachmentsSpec(exemptionId));

    if (exemption == null)
        throw new NotFoundException("طلب الإعفاء غير موجود.");

    if (exemption.Status != ExemptionStatus.PendingManager)
        throw new BusinessException("هذا الطلب ليس في انتظار قرار المدير.");

    //---------------------------------------
    // بيانات المدير
    //---------------------------------------

    exemption.ManagerUserId = managerUserId;
    exemption.ManagerDecisionDate = DateTime.UtcNow;
    exemption.ManagerNote = dto.Note;

    //---------------------------------------
    // قبول
    //---------------------------------------

    if (dto.Status == ExemptionStatus.Approved)
    {
        if (!dto.ExemptionPercentage.HasValue)
            throw new BusinessException("يجب إدخال نسبة الإعفاء.");

        if (dto.ExemptionPercentage < 0 ||
            dto.ExemptionPercentage > 100)
            throw new BusinessException("نسبة الإعفاء يجب أن تكون بين 0 و100.");

        //---------------------------------------
        // البحث عن التقييم الضريبي
        //---------------------------------------

        var assessmentRepo =
            _unitOfWork.GetRepository<TaxAssessment, int>();

        var assessment =
            await assessmentRepo.FirstOrDefaultAsync(
                new TaxAssessmentByUnitAndYearSpec(
                    exemption.UnitId,
                    DateTime.Now.Year));

        if (assessment == null)
            throw new BusinessException("لم يتم العثور على التقييم الضريبي.");

        //---------------------------------------
        // تطبيق الإعفاء
        //---------------------------------------

        assessment.IsExempted = true;

        assessment.ExemptionAmount =
            assessment.AnnualTax *
            (dto.ExemptionPercentage.Value / 100m);

        assessment.TotalDue =
            assessment.AnnualTax -
            assessment.ExemptionAmount +
            assessment.AppealFee;

        if (assessment.TotalDue < 0)
            assessment.TotalDue = 0;

        exemption.DecisionResult = "Approved";

        exemption.ManagerVerdict = "Approved";

        exemption.Status = ExemptionStatus.Approved;

        assessmentRepo.Update(assessment);
    }

    //---------------------------------------
    // رفض
    //---------------------------------------

    else if (dto.Status == ExemptionStatus.Rejected)
    {
        exemption.DecisionResult = "Rejected";

        exemption.ManagerVerdict = "Rejected";

        exemption.Status = ExemptionStatus.Rejected;
    }

    else
    {
        throw new BusinessException("حالة القرار غير صحيحة.");
    }

    exemptionRepo.Update(exemption);

    await _unitOfWork.SaveChangesAsync();
}
#endregion


}
