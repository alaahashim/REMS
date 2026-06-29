using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.DomainLayer.Exceptions;
using Core.Service.Specifications;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class AppealService : IAppealService
    {   private readonly IInstallmentService _installmentService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private const decimal AppealFeeAmount = 50m;

        public AppealService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
             IInstallmentService installmentService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _installmentService = installmentService;

        }

        #region Search Tax Assessments For Appeal

        public async Task<PagedResultDto<AppealAssessmentLookupDto>> SearchAssessmentsForAppealAsync(AppealAssessmentSearchQueryDto query)
        {
            query ??= new AppealAssessmentSearchQueryDto();
            NormalizePaging(query);

            var repo = _unitOfWork.GetRepository<TaxAssessment, int>();
            var assessments = await repo.GetAllAsync(new TaxAssessmentForAppealLookupSpec());

            // فقط التقييمات المعتمدة
            var items = assessments.Where(a => a.Status == TaxStatus.Approved);

            if (query.TaxYear.HasValue)
                items = items.Where(a => a.TaxYear == query.TaxYear.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var term = query.Search.Trim();

                items = items.Where(a =>
                    (a.Owner != null && !string.IsNullOrWhiteSpace(a.Owner.FullName) &&
                     a.Owner.FullName.Contains(term, StringComparison.OrdinalIgnoreCase))
                    ||
                    (a.Owner != null && !string.IsNullOrWhiteSpace(a.Owner.NationalId) &&
                     a.Owner.NationalId.Contains(term, StringComparison.OrdinalIgnoreCase))
                    ||
                    (a.Unit != null && !string.IsNullOrWhiteSpace(a.Unit.UnitNumber) &&
                     a.Unit.UnitNumber.Contains(term, StringComparison.OrdinalIgnoreCase))
                );
            }

            var totalCount = items.Count();

            var pageItems = items
                .OrderByDescending(a => a.TaxYear)
                .ThenByDescending(a => a.CalculationDate)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToList();

            var result = _mapper.Map<List<AppealAssessmentLookupDto>>(pageItems);

            return new PagedResultDto<AppealAssessmentLookupDto>
            {
                Items = result,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        #endregion

        #region Get Appeals List

        public async Task<PagedResultDto<AppealListItemDto>> GetAppealsAsync(AppealListQueryDto query)
        {
            query ??= new AppealListQueryDto();
            NormalizePaging(query);

            var repo = _unitOfWork.GetRepository<Appeal, int>();
            var appeals = await repo.GetAllAsync(new AppealWithDetailsSpec());

            var items = appeals.AsEnumerable();

            if (query.TaxYear.HasValue)
                items = items.Where(a => a.TaxAssessment.TaxYear == query.TaxYear.Value);

            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                items = items.Where(a =>
                    string.Equals(a.Status.ToString(), query.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var term = query.Search.Trim();

                items = items.Where(a =>
                    (a.TaxAssessment.Owner != null &&
                     !string.IsNullOrWhiteSpace(a.TaxAssessment.Owner.FullName) &&
                     a.TaxAssessment.Owner.FullName.Contains(term, StringComparison.OrdinalIgnoreCase))
                    ||
                    (a.TaxAssessment.Owner != null &&
                     !string.IsNullOrWhiteSpace(a.TaxAssessment.Owner.NationalId) &&
                     a.TaxAssessment.Owner.NationalId.Contains(term, StringComparison.OrdinalIgnoreCase))
                    ||
                    (a.TaxAssessment.Unit != null &&
                     !string.IsNullOrWhiteSpace(a.TaxAssessment.Unit.UnitNumber) &&
                     a.TaxAssessment.Unit.UnitNumber.Contains(term, StringComparison.OrdinalIgnoreCase))
                );
            }

            var totalCount = items.Count();

            var pageItems = items
                .OrderByDescending(a => a.AppealDate)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToList();

            var result = _mapper.Map<List<AppealListItemDto>>(pageItems);

            return new PagedResultDto<AppealListItemDto>
            {
                Items = result,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        #endregion

        #region Get Appeal By Id

        public async Task<AppealDetailsDto> GetAppealByIdAsync(int id)
        {
            if (id <= 0)
                throw new ValidationException(new List<string> { "معرّف الطعن غير صحيح" });

            var repo = _unitOfWork.GetRepository<Appeal, int>();
            var attachmentRepo = _unitOfWork.GetRepository<AppealAttachment, int>();

            var appeal = (await repo.GetAllAsync(new AppealWithDetailsSpec(id))).FirstOrDefault();

            if (appeal is null)
                throw new NotFoundException("الطعن غير موجود");

            var attachments = await attachmentRepo.GetAllAsync(new AppealAttachmentByAppealSpec(id));

            var dto = _mapper.Map<AppealDetailsDto>(appeal);
            dto.Attachments = _mapper.Map<List<AppealAttachmentDto>>(attachments);

            return dto;
        }

        #endregion

        #region Create Appeal

        public async Task<AppealCreateResultDto> CreateAppealAsync(CreateAppealDto dto)
        {
            ValidateCreate(dto);

            var appealRepo = _unitOfWork.GetRepository<Appeal, int>();
            var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
            var attachmentRepo = _unitOfWork.GetRepository<AppealAttachment, int>();

            var assessment = (await assessmentRepo.GetAllAsync(new TaxAssessmentForAppealLookupSpec()))
                .FirstOrDefault(a => a.Id == dto.TaxAssessmentId);

            if (assessment is null)
                throw new NotFoundException("التقييم الضريبي غير موجود");

            if (assessment.Status != TaxStatus.Approved)
                throw new ValidationException(new List<string>
                {
                    "لا يمكن إنشاء طعن إلا على تقييم ضريبي معتمد"
                });

            var existingAppeal = (await appealRepo.GetAllAsync(new AppealByTaxAssessmentSpec(dto.TaxAssessmentId)))
                .FirstOrDefault();

            if (existingAppeal is not null)
                throw new ValidationException(new List<string>
                {
                    "تم إنشاء طعن بالفعل على هذا التقييم الضريبي، ويمكن فقط تعديل الطعن الحالي"
                });

            var appeal = new Appeal
            {
                TaxAssessmentId = dto.TaxAssessmentId,
                AppealDate = dto.AppealDate,
                AppealReason = dto.AppealReason.Trim(),
                Status = AppealStatus.PendingCommittee
            };

            await appealRepo.AddAsync(appeal);

            // رسوم الطعن تضاف مرة واحدة فقط عند أول إنشاء طعن
            if (assessment.AppealFee <= 0)
            {
                assessment.AppealFee = AppealFeeAmount;
                assessment.TotalDue = assessment.AnnualTax + assessment.AppealFee;
                assessmentRepo.Update(assessment);
            }

            if (dto.Attachments is not null && dto.Attachments.Any())
            {
                foreach (var item in dto.Attachments)
                {
                    if (string.IsNullOrWhiteSpace(item.FilePath))
                        continue;

                    var attachment = new AppealAttachment
                    {
                        Appeal = appeal,
                        DocumentType = string.IsNullOrWhiteSpace(item.DocumentType) ? "مرفق طعن" : item.DocumentType.Trim(),
                        FilePath = item.FilePath.Trim()
                    };

                    await attachmentRepo.AddAsync(attachment);
                }
            }            assessment.IsAvailableForCollection = false;

            await _unitOfWork.SaveChangesAsync();

            return new AppealCreateResultDto
            {
                AppealId = appeal.Id,
                TaxAssessmentId = appeal.TaxAssessmentId,
                AppealFee = assessment.AppealFee,
                TotalDue = assessment.TotalDue,
                Message = "تم إنشاء الطعن بنجاح وإضافة رسوم الطعن 50 جنيه على التقييم الضريبي"
            };
        }

        #endregion

        #region Update Appeal

        public async Task UpdateAppealAsync(int id, UpdateAppealDto dto)
        {
            ValidateUpdate(id, dto);

            var repo = _unitOfWork.GetRepository<Appeal, int>();
            var attachmentRepo = _unitOfWork.GetRepository<AppealAttachment, int>();

            var appeal = (await repo.GetAllAsync(new AppealWithDetailsSpec(id))).FirstOrDefault();

            if (appeal is null)
                throw new NotFoundException("الطعن غير موجود");

            appeal.AppealDate = dto.AppealDate;
            appeal.AppealReason = dto.AppealReason.Trim();

            if (dto.Status.HasValue)
                appeal.Status = dto.Status.Value;

            repo.Update(appeal);

            // لو أردت استبدال المرفقات بالكامل
            if (dto.Attachments is not null)
            {
                var existingAttachments = await attachmentRepo.GetAllAsync(new AppealAttachmentByAppealSpec(id));

                foreach (var oldAttachment in existingAttachments)
                    attachmentRepo.Remove(oldAttachment);

                foreach (var item in dto.Attachments)
                {
                    if (string.IsNullOrWhiteSpace(item.FilePath))
                        continue;

                    await attachmentRepo.AddAsync(new AppealAttachment
                    {
                        AppealId = appeal.Id,
                        DocumentType = string.IsNullOrWhiteSpace(item.DocumentType) ? "مرفق طعن" : item.DocumentType.Trim(),
                        FilePath = item.FilePath.Trim()
                    });
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        #endregion

        #region Delete Appeal

        public async Task DeleteAppealAsync(int id, bool removeAppealFee = false)
        {
            if (id <= 0)
                throw new ValidationException(new List<string> { "معرّف الطعن غير صحيح" });

            var appealRepo = _unitOfWork.GetRepository<Appeal, int>();
            var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
            var attachmentRepo = _unitOfWork.GetRepository<AppealAttachment, int>();

            var appeal = (await appealRepo.GetAllAsync(new AppealWithDetailsSpec(id))).FirstOrDefault();

            if (appeal is null)
                throw new NotFoundException("الطعن غير موجود");

            var attachments = await attachmentRepo.GetAllAsync(new AppealAttachmentByAppealSpec(id));
            foreach (var attachment in attachments)
                attachmentRepo.Remove(attachment);

            var assessment = appeal.TaxAssessment;

            appealRepo.Remove(appeal);

            // افتراضياً لا نحذف الرسوم
            if (removeAppealFee)
            {
                assessment.AppealFee = 0m;
                assessment.TotalDue = assessment.AnnualTax;
                assessmentRepo.Update(assessment);
            }

            await _unitOfWork.SaveChangesAsync();
        }

        #endregion

        #region Validation

        private static void ValidateCreate(CreateAppealDto dto)
        {
            var errors = new List<string>();

            if (dto.TaxAssessmentId <= 0)
                errors.Add("معرّف التقييم الضريبي مطلوب");

            if (dto.AppealDate == default)
                errors.Add("تاريخ الطعن مطلوب");

            if (string.IsNullOrWhiteSpace(dto.AppealReason))
                errors.Add("سبب الطعن مطلوب");

            if (errors.Count > 0)
                throw new ValidationException(errors);
        }

        private static void ValidateUpdate(int id, UpdateAppealDto dto)
        {
            var errors = new List<string>();

            if (id <= 0)
                errors.Add("معرّف الطعن غير صحيح");

            if (dto.AppealDate == default)
                errors.Add("تاريخ الطعن مطلوب");

            if (string.IsNullOrWhiteSpace(dto.AppealReason))
                errors.Add("سبب الطعن مطلوب");

            if (errors.Count > 0)
                throw new ValidationException(errors);
        }

        private static void NormalizePaging(AppealListQueryDto query)
        {
            if (query.PageNumber <= 0)
                query.PageNumber = 1;

            if (query.PageSize <= 0)
                query.PageSize = 10;

            if (query.PageSize > 100)
                query.PageSize = 100;
        }

        private static void NormalizePaging(AppealAssessmentSearchQueryDto query)
        {
            if (query.PageNumber <= 0)
                query.PageNumber = 1;

            if (query.PageSize <= 0)
                query.PageSize = 10;

            if (query.PageSize > 100)
                query.PageSize = 100;
        }

        #endregion


        #region Committee
public async Task<IEnumerable<CommitteeAppealDto>>
GetCommitteeAppealsAsync()
{
    var repo = _unitOfWork.GetRepository<Appeal, int>();

    var appeals = await repo.GetAllAsync(
        new PendingCommitteeAppealsSpec());

    return _mapper.Map<IEnumerable<CommitteeAppealDto>>(appeals);
}
///////////////////////////////////

public async Task CommitteeDecisionAsync(
    int appealId,
    CommitteeDecisionDto dto,
    int committeeUserId)
{
    var repo =
        _unitOfWork.GetRepository<Appeal,int>();

    var assessmentRepo =
        _unitOfWork.GetRepository<TaxAssessment,int>();

    var appeal =
        (await repo.GetAllAsync(
            new AppealWithDetailsSpec(appealId)))
        .FirstOrDefault();

    if (appeal == null)
        throw new NotFoundException("Appeal not found");

    if (appeal.Status != AppealStatus.PendingCommittee)
        throw new BusinessException("تمت مراجعة هذا الطعن بالفعل");

    appeal.CommitteeVerdict = dto.Verdict;

    appeal.CommitteeNote = dto.Note;

    appeal.CommitteeDecisionDate = DateTime.UtcNow;

    appeal.CommitteeUserId = committeeUserId;

    if (dto.Verdict == "Accept")
    {
        if (!dto.NewTaxAmount.HasValue)
            throw new ValidationException(
            new List<string>
            {
                "New Tax Amount required"
            });

           appeal.TaxAssessment.CommitteeProposedTax = dto.NewTaxAmount.Value;

    }

    appeal.Status = AppealStatus.PendingManager;

    repo.Update(appeal);

    assessmentRepo.Update(appeal.TaxAssessment);

    await _unitOfWork.SaveChangesAsync();
}
#endregion
   
     #region Manager
    
public async Task<IEnumerable<ManagerAppealDto>>
GetManagerAppealsAsync()
{
    var repo =
        _unitOfWork.GetRepository<Appeal, int>();

    var appeals =
        await repo.GetAllAsync(
            new PendingManagerAppealsSpec());

    return _mapper.Map<IEnumerable<ManagerAppealDto>>(appeals);
}
public async Task ManagerDecisionAsync(int appealId, ManagerDecisionDto dto, int managerUserId)
{
    var repo = _unitOfWork.GetRepository<Appeal, int>();
    var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
    var installmentRepo = _unitOfWork.GetRepository<Installment, int>();

    var appeal = await repo.GetByIdAsync(new AppealWithTaxAssessmentSpec(appealId));

    if (appeal == null)
        throw new NotFoundException("الطعن غير موجود.");

    if (appeal.Status != AppealStatus.PendingManager)
        throw new BusinessException("هذا الطعن ليس في انتظار قرار المدير.");

    var assessment = appeal.TaxAssessment;

    if (assessment == null)
        throw new BusinessException("التقييم الضريبي غير موجود.");

    appeal.ManagerUserId = managerUserId;
    appeal.ManagerDecisionDate = DateTime.UtcNow;
    appeal.ManagerNote = dto.Note;

    switch (dto.Status)
    {
        case AppealStatus.Approved:

            if (!dto.ManagerApprovedTax.HasValue)
                throw new BusinessException("يجب إدخال قيمة الضريبة النهائية.");

            if (dto.ManagerApprovedTax.Value < 0)
                throw new BusinessException("قيمة الضريبة غير صحيحة.");

            var installments = assessment.Installments.ToList();

            if (installments.Any(i => i.Payments.Any()))
                throw new BusinessException("لا يمكن تعديل الضريبة بعد بدء السداد.");

            // حذف الأقساط القديمة
            foreach (var installment in installments)
                installmentRepo.Remove(installment);

            // تحديث قيم التقييم
            assessment.ManagerApprovedTax = dto.ManagerApprovedTax.Value;
            assessment.AnnualTax = dto.ManagerApprovedTax.Value;
            assessment.TotalDue = assessment.AnnualTax + assessment.AppealFee;
            assessment.PaymentStatus = PaymentStatus.Pending;
            assessment.IsAvailableForCollection = true;

            // إنشاء الأقساط الجديدة مباشرة بدون SaveChanges وسيطة
            var year = assessment.TaxYear;

            if (assessment.PaymentPlan == PaymentPlan.Full)
            {
                await installmentRepo.AddAsync(new Installment
                {
                    TaxAssessmentId = assessment.Id,
                    InstallmentNumber = 1,
                    Amount = assessment.TotalDue,
                    DueDate = new DateTime(year, 6, 30),
                    Status = InstallmentStatus.Pending
                });
            }
            else if (assessment.PaymentPlan == PaymentPlan.Installment_2)
            {
                var firstAmount = Math.Round(assessment.TotalDue / 2m, 2);
                var secondAmount = assessment.TotalDue - firstAmount;

                await installmentRepo.AddAsync(new Installment
                {
                    TaxAssessmentId = assessment.Id,
                    InstallmentNumber = 1,
                    Amount = firstAmount,
                    DueDate = new DateTime(year, 6, 30),
                    Status = InstallmentStatus.Pending
                });

                await installmentRepo.AddAsync(new Installment
                {
                    TaxAssessmentId = assessment.Id,
                    InstallmentNumber = 2,
                    Amount = secondAmount,
                    DueDate = new DateTime(year, 12, 31),
                    Status = InstallmentStatus.Pending
                });
            }

            appeal.ManagerVerdict = "Approved";
            appeal.Status = AppealStatus.Approved;

            break;

        case AppealStatus.Rejected:

            assessment.IsAvailableForCollection = true;
            appeal.ManagerVerdict = "Rejected";
            appeal.Status = AppealStatus.Rejected;

            break;

        default:
            throw new BusinessException("قرار المدير غير صحيح.");
    }

    repo.Update(appeal);
    assessmentRepo.Update(assessment);

    // حفظ واحد يشمل كل العمليات (حذف الأقساط + إضافة الجديدة + تحديث الطعن والتقييم)
    await _unitOfWork.SaveChangesAsync();
}
#endregion
    }
}
