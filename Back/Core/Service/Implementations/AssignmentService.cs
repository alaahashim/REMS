using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.DomainLayer.Exceptions;
using Core.Service.Specifications;
using Shared.DTOS;

namespace Core.Service.Implementations{

public class AssignmentService : IAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AssignmentService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    // ─────────────────────────────
    // GET ALL ASSIGNMENTS
    // ─────────────────────────────
    public async Task<List<AssignmentDto>> GetAllAsync()
    {
        var repo = _unitOfWork.GetRepository<RoleAssignment, int>();
        var spec = new AssignmentsWithIncludesSpec();

        var data = await repo.GetAllAsync(spec);

        // لو لا توجد بيانات، رجعي List فاضية بدل Exception
        if (data == null || !data.Any())
            return new List<AssignmentDto>();

        return _mapper.Map<List<AssignmentDto>>(data);
    }

    // ─────────────────────────────
    // GET ASSIGNMENTS BY PERSON ID
    // ─────────────────────────────
    public async Task<List<AssignmentDto>> GetByPersonIdAsync(string nationalId)
    {
        if (string.IsNullOrWhiteSpace(nationalId))
        {
            throw new ValidationException(new List<string>
            {
                "الرقم القومي مطلوب"
            });
        }

        var repo = _unitOfWork.GetRepository<RoleAssignment, int>();
        var spec = new AssignmentsByNationalIdSpec(nationalId.Trim());

        var data = await repo.GetAllAsync(spec);

        // لو الشخص ليس له ربطات، رجعي List فاضية
        if (data == null || !data.Any())
            return new List<AssignmentDto>();

        return _mapper.Map<List<AssignmentDto>>(data);
    }

    // ─────────────────────────────
    // CREATE BULK ASSIGNMENTS
    // ─────────────────────────────
    public async Task CreateBulkAsync(List<CreateAssignmentDto> dtoList)
    {
        // 1) Validation على مستوى القائمة
        if (dtoList == null || !dtoList.Any())
        {
            throw new ValidationException(new List<string>
            {
                "قائمة الربط لا يمكن أن تكون فارغة"
            });
        }

        var ownerRepo = _unitOfWork.GetRepository<Owner, int>();
        var assignmentRepo = _unitOfWork.GetRepository<RoleAssignment, int>();
        var propertyRepo = _unitOfWork.GetRepository<Property, int>();
        var unitRepo = _unitOfWork.GetRepository<Unit, int>();

        // تحميل الملاك الحاليين مرة واحدة فقط بدل GetAllAsync داخل كل loop
        var existingOwners = (await ownerRepo.GetAllAsync()).ToList();

        foreach (var dto in dtoList)
        {
            // 2) Validation لكل DTO
            ValidateAssignmentDto(dto);

            // 3) التأكد أن العقار موجود
            var property = await propertyRepo.GetByIdAsync(dto.PropertyId);
            if (property == null)
            {
                throw new NotFoundException($"العقار رقم {dto.PropertyId} غير موجود");
            }

            // 4) التأكد أن الوحدة موجودة
            var unit = await unitRepo.GetByIdAsync(dto.UnitId);
            if (unit == null)
            {
                throw new NotFoundException($"الوحدة رقم {dto.UnitId} غير موجودة");
            }

            // 5) التأكد أن الوحدة تتبع العقار المختار
            if (unit.PropertyId != dto.PropertyId)
            {
                throw new BusinessException(
                    $"الوحدة رقم {dto.UnitId} لا تتبع العقار رقم {dto.PropertyId}"
                );
            }

            // 6) البحث عن المالك الحالي
            var owner = existingOwners.FirstOrDefault(x => x.NationalId == dto.PersonId.Trim());

            // 7) لو المالك غير موجود → أنشئيه
            if (owner == null)
            {
                owner = new Owner
                {
                    NationalId = dto.PersonId.Trim(),
                    FullName = dto.PersonName.Trim(),
                    Phone = dto.ContactPhone?.Trim() ?? string.Empty,
                    Address = dto.Address?.Trim() ?? string.Empty,
                    OwnerType = "Individual",
                    IsActive = true
                };

                await ownerRepo.AddAsync(owner);
                existingOwners.Add(owner); // حتى لا يتكرر داخل نفس الطلب
            }

            // 8) Business Rule إضافية (اختيارية لكن مفيدة)
            // منع تكرار نفس الربط لنفس المالك ونفس الوحدة ونفس الدور لو كان Active
            var existingAssignments = await assignmentRepo.GetAllAsync();
            bool duplicateAssignment = existingAssignments.Any(a =>
                a.OwnerId == owner.Id &&
                a.UnitId == dto.UnitId &&
                a.RoleType == dto.RoleType &&
                a.IsActive);

            if (duplicateAssignment)
            {
                throw new BusinessException(
                    $"يوجد بالفعل ربط نشط لهذا المالك على الوحدة رقم {dto.UnitId} بنفس الدور"
                );
            }

            // 9) إنشاء الربط
            var assignment = new RoleAssignment
            {
                Owner = owner,
                UnitId = dto.UnitId,
                RoleType = dto.RoleType.Trim(),
                ShareType = dto.ShareType.Trim(),
                SharePercentage = dto.SharePercentage,
                StartDate = dto.OwnershipStartDate,
                EndDate = dto.OwnershipEndDate,
                IsActive = dto.IsActive
            };

            await assignmentRepo.AddAsync(assignment);
        }

        // 10) حفظ مرة واحدة فقط
        await _unitOfWork.SaveChangesAsync();
    }

    // ─────────────────────────────
    // PRIVATE VALIDATION METHOD
    // ─────────────────────────────
    private static void ValidateAssignmentDto(CreateAssignmentDto dto)
    {
        var errors = new List<string>();

        if (dto == null)
        {
            throw new ValidationException(new List<string>
            {
                "بيانات الربط غير صالحة"
            });
        }

        // بيانات الشخص
        if (string.IsNullOrWhiteSpace(dto.PersonId))
            errors.Add("الرقم القومي مطلوب");

        if (string.IsNullOrWhiteSpace(dto.PersonName))
            errors.Add("اسم المالك مطلوب");

        if (string.IsNullOrWhiteSpace(dto.ContactPhone))
            errors.Add("رقم الهاتف مطلوب");

        if (string.IsNullOrWhiteSpace(dto.Address))
            errors.Add("العنوان مطلوب");

        // بيانات العقار والوحدة
        if (dto.PropertyId <= 0)
            errors.Add("يجب اختيار عقار صحيح");

        if (dto.UnitId <= 0)
            errors.Add("يجب اختيار وحدة صحيحة");

        // بيانات الربط
        if (string.IsNullOrWhiteSpace(dto.RoleType))
            errors.Add("نوع الدور مطلوب");

        if (string.IsNullOrWhiteSpace(dto.ShareType))
            errors.Add("نوع الحصة مطلوب");

        // نسبة الحصة
        if (dto.SharePercentage < 0 || dto.SharePercentage > 100)
            errors.Add("نسبة الحصة يجب أن تكون بين 0 و 100");

        // التاريخ
        if (dto.OwnershipStartDate == default)
            errors.Add("تاريخ بداية الملكية مطلوب");

        if (dto.OwnershipEndDate.HasValue &&
            dto.OwnershipEndDate.Value < dto.OwnershipStartDate)
        {
            errors.Add("تاريخ نهاية الملكية يجب أن يكون بعد تاريخ البداية");
        }

        if (errors.Any())
            throw new ValidationException(errors);
    }
}}