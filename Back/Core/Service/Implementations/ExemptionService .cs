using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.DomainLayer.Exceptions;
using Core.ServiceAbstraction;
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
        entity.Status = WorkflowStatus.PendingReview;

        if (attachment != null && attachment.Content.Length > 0)
        {
            entity.Attachments.Add(await SaveAttachmentAsync(attachment));
        }

        await repo.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return entity.Id;
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
}