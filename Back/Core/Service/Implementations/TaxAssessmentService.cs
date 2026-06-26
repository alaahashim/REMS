using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.DomainLayer.Exceptions;
using Core.Service.Specifications;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class TaxAssessmentService : ITaxAssessmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IServiceManager _serviceManager;

        // =========================
        // Constants
        // =========================
        private const decimal EgyptianTaxExemptionThreshold = 24_000m;
        private const decimal FallbackTaxRate = 0.10m;
        private const decimal FallbackResidentialDiscount = 0.30m;
        private const decimal FallbackNonResidentialDiscount = 0.32m;
        private const decimal AppealFeeAmount = 50m;

        public TaxAssessmentService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IServiceManager serviceManager)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _serviceManager = serviceManager;
        }

        #region Reviewer Tasks

        public async Task<PagedResultDto<ReviewerTaxTaskListItemDto>> GetReviewerTasksAsync(ReviewerTaxTasksQueryDto query)
        {
            query ??= new ReviewerTaxTasksQueryDto();
            NormalizePaging(query);

            var unitRepo = _unitOfWork.GetRepository<Unit, int>();
            var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();

            var units = await unitRepo.GetAllAsync(new UnitsForReviewerTaxTasksSpec());
            var assessments = await assessmentRepo.GetAllAsync();

            var approvedUnitIds = assessments
                .Where(a => a.Status == TaxStatus.Approved)
                .Select(a => a.UnitId)
                .Distinct()
                .ToHashSet();

        var items = units.Select(unit =>
{
    var dto = _mapper.Map<ReviewerTaxTaskListItemDto>(unit);

    var primaryOwner = GetPrimaryOwner(unit);

    var latestAssessment = assessments
        .Where(a => a.UnitId == unit.Id)
        .OrderByDescending(a => a.TaxYear)
        .ThenByDescending(a => a.CalculationDate)
        .FirstOrDefault();

    dto.OwnerName = primaryOwner?.Owner?.FullName ?? "-";
    dto.PropertyAddress = BuildPropertyAddress(unit.Property);
    dto.Usage = unit.UsageType ?? "-";
    dto.TaxStatus = latestAssessment?.Status ?? TaxStatus.PendingCalculation;
    dto.TaxYear = latestAssessment?.TaxYear;

    return dto;
});

            items = ApplyReviewerTaskFilters(items, query);

            var totalCount = items.Count();

            var pagedItems = items
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ToList();

            return new PagedResultDto<ReviewerTaxTaskListItemDto>
            {
                Items = pagedItems,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
            };
        }

        public async Task<ReviewerTaxTaskDetailsDto> GetReviewerTaskDetailsAsync(int unitId)
        {
            if (unitId <= 0)
                throw new ValidationException(new List<string> { "معرّف الوحدة غير صحيح" });

            var unit = await LoadUnitOrThrowAsync(unitId);

            var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
            var assessments = await assessmentRepo.GetAllAsync(new TaxAssessmentByUnitSpec(unitId));

            var latestAssessment = assessments
                .OrderByDescending(a => a.TaxYear)
                .ThenByDescending(a => a.CalculationDate)
                .FirstOrDefault();

            var dto = _mapper.Map<ReviewerTaxTaskDetailsDto>(unit);

            dto.PropertyAddress = BuildPropertyAddress(unit.Property);
            dto.Usage = unit.UsageType ?? "-";
            dto.TaxStatus = latestAssessment?.Status ?? TaxStatus.PendingCalculation;

            dto.Owners = GetOwners(unit)
                .Select(a => new PersonRoleDto
                {
                    OwnerId = a.OwnerId,
                    FullName = a.Owner?.FullName ?? string.Empty,
                    RoleType = a.RoleType,
                    SharePercentage = a.SharePercentage,
                    Phone = a.Owner?.Phone
                })
                .ToList();

            dto.Tenants = GetTenants(unit)
                .Select(a => new PersonRoleDto
                {
                    OwnerId = a.OwnerId,
                    FullName = a.Owner?.FullName ?? string.Empty,
                    RoleType = a.RoleType,
                    SharePercentage = a.SharePercentage,
                    Phone = a.Owner?.Phone
                })
                .ToList();

            return dto;
        }

        #endregion

        #region Preview / Approve / Get Assessment

        public async Task<TaxCalculationResultDto> PreviewCalculationAsync(TaxCalculationRequestDto dto)
        {
            ValidateTaxCalculationRequest(dto);

            var unit = await LoadUnitOrThrowAsync(dto.UnitId);
            var rules = await LoadActiveRulesAsync(dto.TaxYear);

            return await ComputeAsync(dto, unit, rules);
        }

        public async Task<int> ApproveCalculationAsync(ApproveTaxAssessmentDto dto)
        {
            ValidateApproveRequest(dto);

            var previewRequest = new TaxCalculationRequestDto
            {
                UnitId = dto.UnitId,
                TaxYear = dto.TaxYear,
                AnnualRentOverride = dto.AnnualRentOverride,
                PayerType = dto.PayerType,
                PaymentPlan = dto.PaymentPlan,
            };

            var preview = await PreviewCalculationAsync(previewRequest);

            var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
            var unitRepo = _unitOfWork.GetRepository<Unit, int>();

            var existing = (await assessmentRepo.GetAllAsync(
                    new TaxAssessmentByUnitYearSpec(dto.UnitId, dto.TaxYear)))
                .FirstOrDefault();

            int savedId;

            if (existing is not null)
            {
                _mapper.Map(preview, existing);

                existing.Status = TaxStatus.Approved;
                existing.CalculationDate = DateTime.UtcNow;
                existing.Notes = preview.IsFromManualAnnualRent
                    ? "تم تجاوز القيمة الإيجارية يدوياً"
                    : null;

                assessmentRepo.Update(existing);
                savedId = existing.Id;
            }
            else
            {
                var entity = _mapper.Map<TaxAssessment>(preview);

                entity.Status = TaxStatus.Approved;
                entity.CalculationDate = DateTime.UtcNow;
                entity.Notes = preview.IsFromManualAnnualRent
                    ? "تم تجاوز القيمة الإيجارية يدوياً"
                    : null;

                await assessmentRepo.AddAsync(entity);
                savedId = entity.Id;
            }

            var unit = await unitRepo.GetByIdAsync(dto.UnitId);
            if (unit is null)
                throw new NotFoundException($"الوحدة رقم {dto.UnitId} غير موجودة");

            unit.Status = TaxStatus.Approved.ToString();
            unitRepo.Update(unit);

            await _unitOfWork.SaveChangesAsync();
            return savedId;
        }

        public async Task<TaxAssessmentDto?> GetAssessmentByUnitYearAsync(int unitId, int taxYear)
        {
            ValidateUnitYear(unitId, taxYear);

            var repo = _unitOfWork.GetRepository<TaxAssessment, int>();

            var entity = (await repo.GetAllAsync(new TaxAssessmentByUnitYearSpec(unitId, taxYear)))
                .FirstOrDefault();

            return entity is null ? null : _mapper.Map<TaxAssessmentDto>(entity);
        }

        #endregion

        #region Compute

        private async Task<TaxCalculationResultDto> ComputeAsync(
            TaxCalculationRequestDto dto,
            Unit unit,
            IEnumerable<TaxRule> rules)
        {
            var primaryOwner = GetPrimaryOwner(unit)?.Owner;
            var isResidential = IsResidential(unit.UsageType);

            var annualRent = dto.AnnualRentOverride is > 0
                ? dto.AnnualRentOverride.Value
                : EstimateAnnualRent(unit);

            var discountRate = isResidential
                ? GetRuleValue(rules, "RESIDENTIAL_DISCOUNT", FallbackResidentialDiscount)
                : GetRuleValue(rules, "NON_RESIDENTIAL_DISCOUNT", FallbackNonResidentialDiscount);

            var discountAmount = Math.Round(annualRent * discountRate, 2);
            var netAnnualRentalValue = Math.Round(annualRent - discountAmount, 2);

            var exemption = new TaxExemptionCheckResultDto
            {
                IsExempted = false,
                ExemptionAmount = 0m,
                ExemptionReason = null
            };

            if (primaryOwner is not null && isResidential && netAnnualRentalValue <= EgyptianTaxExemptionThreshold)
            {
                exemption = await _serviceManager.ExemptionService.CheckTaxExemptionAsync(
                    primaryOwner.Id,
                    unit.Id,
                    dto.TaxYear,
                    netAnnualRentalValue);
            }

            var taxRate = GetRuleValue(rules, "TAX_RATE", FallbackTaxRate);
            var taxableAmount = Math.Max(0m, netAnnualRentalValue - exemption.ExemptionAmount);
            var annualTax = Math.Round(taxableAmount * taxRate, 2);

           // var appealFee = dto.IncludeAppealFee ? AppealFeeAmount : 0m;
            var totalDue = annualTax ;//+ appealFee;

            var installmentCount = dto.PaymentPlan == PaymentPlan.Installment_2 ? 2 : 1;
            var installmentAmount = installmentCount > 1
                ? Math.Round(totalDue / installmentCount, 2)
                : totalDue;

            return new TaxCalculationResultDto
            {
                UnitId = unit.Id,
                OwnerId = primaryOwner?.Id,
                OwnerName = primaryOwner?.FullName ?? "-",
                TaxYear = dto.TaxYear,
                Usage = unit.UsageType ?? "-",
                AnnualRent = annualRent,

                // للفرونت كنسبة مئوية
                DiscountRate = discountRate * 100m,
                DiscountAmount = discountAmount,
                NetAnnualRentalValue = netAnnualRentalValue,

                // للفرونت كنسبة مئوية
                TaxRate = taxRate * 100m,
                AnnualTax = annualTax,

                IsExempted = exemption.IsExempted,
                ExemptionAmount = exemption.ExemptionAmount,
                ExemptionReason = exemption.ExemptionReason,

              //  AppealFee = appealFee,
                TotalDue = totalDue,

                PayerType = dto.PayerType,
                PaymentPlan = dto.PaymentPlan,
                InstallmentCount = installmentCount,
                InstallmentAmount = installmentAmount,

                ZoneDescription = BuildPropertyAddress(unit.Property),
                IsFromManualAnnualRent = dto.AnnualRentOverride is > 0
            };
        }

        #endregion

        #region Loaders

        private async Task<Unit> LoadUnitOrThrowAsync(int unitId)
        {
            var repo = _unitOfWork.GetRepository<Unit, int>();

            var unit = (await repo.GetAllAsync(new UnitForTaxCalculationSpec(unitId)))
                .FirstOrDefault();
if (unit is not null)
{
    var assignmentsCount = unit.Assignments?.Count ?? 0;

    Console.WriteLine($"UnitId = {unit.Id}");
    Console.WriteLine($"Assignments Count = {assignmentsCount}");

    if (unit.Assignments is not null)
    {
        foreach (var a in unit.Assignments)
        {
            Console.WriteLine($"Assignment Id = {a.Id}, OwnerId = {a.OwnerId}, RoleType = {a.RoleType}, IsActive = {a.IsActive}, Share = {a.SharePercentage}");
            Console.WriteLine($"Owner Loaded? {(a.Owner != null ? "YES" : "NO")}");
            Console.WriteLine($"Owner Name = {a.Owner?.FullName}");
        }
    }
}
            if (unit is null)
                throw new NotFoundException($"الوحدة رقم {unitId} غير موجودة");

            return unit;
        }

        private async Task<IEnumerable<TaxRule>> LoadActiveRulesAsync(int taxYear)
        {
            var repo = _unitOfWork.GetRepository<TaxRule, int>();
            var referenceDate = new DateTime(taxYear, 1, 1);

            return await repo.GetAllAsync(new ActiveTaxRulesSpec(referenceDate));
        }

        #endregion

        #region Validation

        private static void ValidateTaxCalculationRequest(TaxCalculationRequestDto dto)
        {
            var errors = new List<string>();

            if (dto.UnitId <= 0)
                errors.Add("معرّف الوحدة مطلوب");

            if (dto.TaxYear < 2010 || dto.TaxYear > DateTime.UtcNow.Year + 1)
                errors.Add("السنة الضريبية غير صحيحة");

            if (dto.AnnualRentOverride is < 0)
                errors.Add("القيمة الإيجارية لا يمكن أن تكون سالبة");

            if (!Enum.IsDefined(typeof(PayerType), dto.PayerType))
                errors.Add("نوع دافع الضريبة غير صحيح");

            if (!Enum.IsDefined(typeof(PaymentPlan), dto.PaymentPlan))
                errors.Add("خطة السداد غير صحيحة");

            if (errors.Count > 0)
                throw new ValidationException(errors);
        }

        private static void ValidateApproveRequest(ApproveTaxAssessmentDto dto)
        {
            var errors = new List<string>();

            if (dto.UnitId <= 0)
                errors.Add("معرّف الوحدة مطلوب");

            if (dto.TaxYear < 2010 || dto.TaxYear > DateTime.UtcNow.Year + 1)
                errors.Add("السنة الضريبية غير صحيحة");

            if (dto.AnnualRentOverride is < 0)
                errors.Add("القيمة الإيجارية لا يمكن أن تكون سالبة");

            if (!Enum.IsDefined(typeof(PayerType), dto.PayerType))
                errors.Add("نوع دافع الضريبة غير صحيح");

            if (!Enum.IsDefined(typeof(PaymentPlan), dto.PaymentPlan))
                errors.Add("خطة السداد غير صحيحة");

            if (errors.Count > 0)
                throw new ValidationException(errors);
        }

        private static void ValidateUnitYear(int unitId, int taxYear)
        {
            var errors = new List<string>();

            if (unitId <= 0)
                errors.Add("معرّف الوحدة غير صحيح");

            if (taxYear < 2010 || taxYear > DateTime.UtcNow.Year + 1)
                errors.Add("السنة الضريبية غير صحيحة");

            if (errors.Count > 0)
                throw new ValidationException(errors);
        }

        private static void NormalizePaging(ReviewerTaxTasksQueryDto query)
        {
            if (query.PageNumber <= 0)
                query.PageNumber = 1;

            if (query.PageSize <= 0)
                query.PageSize = 10;

            if (query.PageSize > 100)
                query.PageSize = 100;
        }

        #endregion

        #region Helpers

        private static IEnumerable<ReviewerTaxTaskListItemDto> ApplyReviewerTaskFilters(
            IEnumerable<ReviewerTaxTaskListItemDto> items,
            ReviewerTaxTasksQueryDto query)
        {
            if (!string.IsNullOrWhiteSpace(query.Status))
            {
                items = items.Where(x =>
                    string.Equals(x.TaxStatus.ToString(), query.Status, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(query.OwnerName))
            {
                items = items.Where(x =>
                    !string.IsNullOrWhiteSpace(x.OwnerName) &&
                    x.OwnerName.Contains(query.OwnerName, StringComparison.OrdinalIgnoreCase));
            }

            return items;
        }

        private static decimal GetRuleValue(IEnumerable<TaxRule> rules, string code, decimal fallback)
            => rules.FirstOrDefault(r => r.RuleCode == code)?.RuleValue ?? fallback;

        private static bool IsResidential(string? usageType)
        {
            if (string.IsNullOrWhiteSpace(usageType))
                return true;

            var value = usageType.Trim().ToLowerInvariant();
            return value is "residential" or "سكني" or "سكنى";
        }

        private static decimal EstimateAnnualRent(Unit unit)
        {
            var area = Convert.ToDecimal(unit.Area);
            var usageKey = (unit.UsageType ?? string.Empty).Trim().ToLowerInvariant();

            decimal monthlyRatePerMeter = usageKey switch
            {
                "commercial" or "تجاري" => 60m,
                "industrial" or "صناعي" => 40m,
                _ => 30m
            };

            return Math.Round(area * monthlyRatePerMeter * 12m, 2);
        }

        private static RoleAssignment? GetPrimaryOwner(Unit unit)
        {
            return unit.Assignments?
                .Where(a => a.IsActive && a.Owner != null && IsOwnerRole(a.RoleType))
                .OrderByDescending(a => a.SharePercentage)
                .FirstOrDefault();
        }

        private static List<RoleAssignment> GetOwners(Unit unit)
        {
            return unit.Assignments?
                .Where(a => a.IsActive && a.Owner != null && IsOwnerRole(a.RoleType))
                .ToList()
                ?? new List<RoleAssignment>();
        }

        private static List<RoleAssignment> GetTenants(Unit unit)
        {
            return unit.Assignments?
                .Where(a => a.IsActive && a.Owner != null && IsTenantRole(a.RoleType))
                .ToList()
                ?? new List<RoleAssignment>();
        }

     private static bool IsOwnerRole(string? roleType)
{
    if (string.IsNullOrWhiteSpace(roleType))
        return false;

    var value = roleType.Trim().ToLowerInvariant();
    return value is "owner" or "مالك";
}

private static bool IsTenantRole(string? roleType)
{
    if (string.IsNullOrWhiteSpace(roleType))
        return false;

    var value = roleType.Trim().ToLowerInvariant();
    return value is "tenant" or "مستأجر" or "مستاجر";
}
        private static string BuildPropertyAddress(Property? property)
        {
            if (property is null)
                return "-";

            var parts = new List<string>();

            if (!string.IsNullOrWhiteSpace(property.Governorate?.Name))
                parts.Add(property.Governorate.Name);

            if (!string.IsNullOrWhiteSpace(property.Neighborhood?.Name))
                parts.Add(property.Neighborhood.Name);

            if (!string.IsNullOrWhiteSpace(property.BuildingNo))
                parts.Add($"مبنى {property.BuildingNo}");

            return parts.Count == 0 ? "-" : string.Join(" - ", parts);
        }

        #endregion
  public async Task DeleteAssessmentAsync(int unitId, int taxYear, bool deleteRelatedAppeals = false)
{
    ValidateUnitYear(unitId, taxYear);

    var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
    var unitRepo = _unitOfWork.GetRepository<Unit, int>();
    var appealRepo = _unitOfWork.GetRepository<Appeal, int>();
    var appealAttachmentRepo = _unitOfWork.GetRepository<AppealAttachment, int>();

    var assessment = (await assessmentRepo.GetAllAsync(
        new TaxAssessmentByUnitYearSpec(unitId, taxYear)))
        .FirstOrDefault();

    if (assessment is null)
        throw new NotFoundException("لا يوجد تقييم ضريبي لهذه الوحدة في السنة المحددة");

    // الطعون المرتبطة بهذا التقييم
    var allAppeals = await appealRepo.GetAllAsync();
    var relatedAppeals = allAppeals
        .Where(a => a.TaxAssessmentId == assessment.Id)
        .ToList();

    // لو فيه طعون ولم يوافق المستخدم على حذفها -> امنع التنفيذ
    if (relatedAppeals.Any() && !deleteRelatedAppeals)
    {
        throw new ValidationException(new List<string>
        {
            "هذا التقييم الضريبي مرتبط بطعون. يجب تأكيد حذف الطعون المرتبطة أولاً."
        });
    }

    // حذف مرفقات الطعون ثم حذف الطعون
    if (relatedAppeals.Any())
    {
        var allAttachments = await appealAttachmentRepo.GetAllAsync();
        var relatedAppealIds = relatedAppeals.Select(a => a.Id).ToHashSet();

        var relatedAttachments = allAttachments
            .Where(x => relatedAppealIds.Contains(x.AppealId))
            .ToList();

        foreach (var attachment in relatedAttachments)
            appealAttachmentRepo.Remove(attachment);

        foreach (var appeal in relatedAppeals)
            appealRepo.Remove(appeal);
    }

    // حذف التقييم نفسه
    assessmentRepo.Remove(assessment);

    // تحديث حالة الوحدة بناءً على آخر تقييم متبقٍ
    var allUnitAssessments = await assessmentRepo.GetAllAsync();
    var remainingAssessments = allUnitAssessments
        .Where(a => a.UnitId == unitId && a.Id != assessment.Id)
        .OrderByDescending(a => a.TaxYear)
        .ThenByDescending(a => a.CalculationDate)
        .ToList();

    var unit = await unitRepo.GetByIdAsync(unitId);
    if (unit is null)
        throw new NotFoundException($"الوحدة رقم {unitId} غير موجودة");

    if (!remainingAssessments.Any())
    {
        unit.Status = TaxStatus.PendingCalculation.ToString();
    }
    else
    {
        var latestRemaining = remainingAssessments.First();
        unit.Status = latestRemaining.Status.ToString();
    }

    unitRepo.Update(unit);
    await _unitOfWork.SaveChangesAsync();
}
   

 public async Task RevertApprovedAssessmentAsync(int unitId, int taxYear, bool deleteRelatedAppeals = false)
{
    ValidateUnitYear(unitId, taxYear);

    var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
    var unitRepo = _unitOfWork.GetRepository<Unit, int>();
    var appealRepo = _unitOfWork.GetRepository<Appeal, int>();
    var appealAttachmentRepo = _unitOfWork.GetRepository<AppealAttachment, int>();

    var assessment = (await assessmentRepo.GetAllAsync(
        new TaxAssessmentByUnitYearSpec(unitId, taxYear)))
        .FirstOrDefault();

    if (assessment is null)
        throw new NotFoundException("لا يوجد تقييم ضريبي لهذه الوحدة في السنة المحددة");

    if (assessment.Status != TaxStatus.Approved)
        throw new ValidationException(new List<string>
        {
            "لا يمكن إرجاع تقييم غير معتمد إلى انتظار الحساب"
        });

    var allAppeals = await appealRepo.GetAllAsync();
    var relatedAppeals = allAppeals
        .Where(a => a.TaxAssessmentId == assessment.Id)
        .ToList();

    // لو يوجد طعون ولم يتم تأكيد حذفها -> امنع التنفيذ
    if (relatedAppeals.Any() && !deleteRelatedAppeals)
    {
        throw new ValidationException(new List<string>
        {
            "هذا التقييم الضريبي مرتبط بطعون. يجب تأكيد حذف الطعون المرتبطة أولاً."
        });
    }

    // لو وافق المستخدم نحذف الطعون ومرفقاتها
    if (relatedAppeals.Any())
    {
        var allAttachments = await appealAttachmentRepo.GetAllAsync();
        var relatedAppealIds = relatedAppeals.Select(a => a.Id).ToHashSet();

        var relatedAttachments = allAttachments
            .Where(x => relatedAppealIds.Contains(x.AppealId))
            .ToList();

        foreach (var attachment in relatedAttachments)
            appealAttachmentRepo.Remove(attachment);

        foreach (var appeal in relatedAppeals)
            appealRepo.Remove(appeal);
    }

    // إرجاع التقييم نفسه إلى Pending
    assessment.Status = TaxStatus.PendingCalculation;
    assessment.CalculationDate = DateTime.UtcNow;

    assessmentRepo.Update(assessment);

    var unit = await unitRepo.GetByIdAsync(unitId);
    if (unit is null)
        throw new NotFoundException($"الوحدة رقم {unitId} غير موجودة");

    unit.Status = TaxStatus.PendingCalculation.ToString();
    unitRepo.Update(unit);

    await _unitOfWork.SaveChangesAsync();
}
   
   public async Task<bool> HasAppealsAsync(int unitId, int taxYear)
{
    ValidateUnitYear(unitId, taxYear);

    var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
    var appealRepo = _unitOfWork.GetRepository<Appeal, int>();

    var assessment = (await assessmentRepo.GetAllAsync(
        new TaxAssessmentByUnitYearSpec(unitId, taxYear)))
        .FirstOrDefault();

    if (assessment is null)
        throw new NotFoundException("لا يوجد تقييم ضريبي لهذه الوحدة في السنة المحددة");

    var appeals = await appealRepo.GetAllAsync();
    return appeals.Any(a => a.TaxAssessmentId == assessment.Id);
}
    }
}