using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.DomainLayer.Entities.AdminModule;
using Core.DomainLayer.Exceptions;
using Core.Service.Specifications;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class FinanceService : IFinanceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IInstallmentService _installmentService;

        public FinanceService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IInstallmentService installmentService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _installmentService = installmentService;
        }

        // ============================================================
        // SEARCH (الرقم القومي / اسم المالك)
        // ============================================================
      public async Task<FinanceSearchResponseDto?> SearchAsync(FinanceSearchRequestDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Search))
        throw new Exception("يجب إدخال اسم المالك أو الرقم القومي.");

    var repo = _unitOfWork.GetRepository<TaxAssessment, int>();
    var spec = new FinanceSearchSpecification(dto.Search.Trim());
    var assessment = await repo.FirstOrDefaultAsync(spec);

    return assessment == null
        ? null
        : _mapper.Map<FinanceSearchResponseDto>(assessment);
}
        // ============================================================
        // REGISTER PAYMENT
        // ============================================================
       public async Task<PaymentReceiptDto> RegisterPaymentAsync(CreatePaymentDto dto)
{
    if (dto.InstallmentIds == null || !dto.InstallmentIds.Any())
        throw new ValidationException(new List<string>
        {
            "يجب اختيار قسط واحد على الأقل."
        });

    var installmentRepo = _unitOfWork.GetRepository<Installment, int>();
    var paymentRepo = _unitOfWork.GetRepository<Payment, int>();

    // ---------------------------------
    // التأكد أن رقم الإيصال غير مستخدم
    // ---------------------------------
    var existingReceipt = await paymentRepo.FirstOrDefaultAsync(
        new PaymentReceiptNumberSpecification(dto.ReceiptNo));

    if (existingReceipt != null)
        throw new BusinessException("رقم الإيصال مستخدم بالفعل.");

    // ---------------------------------
    // جلب الأقساط
    // ---------------------------------
    var installments = (await installmentRepo.GetAllAsync(
        new InstallmentsForPaymentSpecification(dto.InstallmentIds)))
        .ToList();

    if (installments.Count != dto.InstallmentIds.Count)
        throw new NotFoundException("بعض الأقساط غير موجودة.");

    // ---------------------------------
    // التأكد أن جميع الأقساط لنفس التقييم
    // ---------------------------------
    var assessmentId = installments.First().TaxAssessmentId;

    if (installments.Any(i => i.TaxAssessmentId != assessmentId))
        throw new BusinessException("لا يمكن سداد أقساط من تقييمات مختلفة.");

    // ---------------------------------
    // التأكد أن التقييم مازال متاحاً للتحصيل
    // ---------------------------------
    var assessment = installments.First().TaxAssessment;

    if (!assessment.IsAvailableForCollection)
        throw new BusinessException(
            "هذا التقييم غير متاح حالياً للتحصيل لأنه قيد المراجعة أو الطعن.");

    if (assessment.Status != TaxStatus.Approved)
        throw new BusinessException(
            "هذا التقييم غير معتمد.");

    // ---------------------------------
    // التأكد من حالة الأقساط
    // ---------------------------------
    foreach (var installment in installments)
    {
        if (installment.Status == InstallmentStatus.Paid)
            throw new BusinessException(
                $"القسط رقم {installment.InstallmentNumber} تم سداده بالفعل.");
    }

    // ---------------------------------
    // إنشاء المدفوعات
    // ---------------------------------
    decimal totalPaid = 0;

    foreach (var installment in installments)
    {
        var payment = new Payment
        {
            InstallmentId = installment.Id,
            PaidAmount = installment.Amount,
            PaymentDate = dto.PaymentDate,
            ReceiptNo = dto.ReceiptNo,
            Method = dto.Method,
            EmployeeId = dto.EmployeeId,
            Notes = dto.Notes
        };

        await paymentRepo.AddAsync(payment);

        installment.Status = InstallmentStatus.Paid;

        installmentRepo.Update(installment);

        totalPaid += installment.Amount;
    }

    await _unitOfWork.SaveChangesAsync();

    // ---------------------------------
    // تحديث حالة التقييم
    // ---------------------------------
    await _installmentService.UpdateAssessmentPaymentStatusAsync(
        assessmentId);

    // ---------------------------------
    // إنشاء الإيصال
    // ---------------------------------
    return new PaymentReceiptDto
    {
        ReceiptNo = dto.ReceiptNo,

        UnitId = assessment.UnitId,

        OwnerName = assessment.Owner?.FullName ?? "",

        Address =
            $"{assessment.Unit.Property.Governorate.Name} - " +
            $"{assessment.Unit.Property.Neighborhood.Name} - " +
            $"{assessment.Unit.Property.Neighborhood.Center.Name}",

        TotalPaid = totalPaid,

        Method = dto.Method,

        PaymentDate = dto.PaymentDate,

        InstallmentNumbers = installments
            .OrderBy(i => i.InstallmentNumber)
            .Select(i => i.InstallmentNumber)
            .ToList()
    };
}

        // ============================================================
        // PAYMENT HISTORY (للـ Front-end table)
        // ============================================================
      public async Task<PagedResult<PaymentHistoryDto>> GetPaymentHistoryAsync(
    int pageIndex = 1, int pageSize = 8)
{
    var repo = _unitOfWork.GetRepository<Payment, int>();

    var payments = await repo.GetAllAsync(
        new PaymentHistorySpecification(pageIndex, pageSize));

    var totalCount = await repo.CountAsync(
        new PaymentHistoryCountSpecification());

    return new PagedResult<PaymentHistoryDto>
    {
        Items     = _mapper.Map<IEnumerable<PaymentHistoryDto>>(payments),
        TotalCount = totalCount,
        PageIndex  = pageIndex,
        PageSize   = pageSize,
        TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    };
}

        // ============================================================
        // DASHBOARD
        // ============================================================
        public async Task<FinanceDashboardDto> GetDashboardAsync()
        {
            var repo = _unitOfWork.GetRepository<TaxAssessment, int>();

            var assessments = await repo.GetAllAsync(
                new DashboardAssessmentSpecification());

            var list = assessments.ToList();

            return new FinanceDashboardDto
            {
                TotalAssessments = list.Count,

                PaidAssessments = list.Count(x =>
                    x.PaymentStatus == PaymentStatus.Paid),

                PendingAssessments = list.Count(x =>
                    x.PaymentStatus == PaymentStatus.Pending
                    || x.PaymentStatus == PaymentStatus.PartiallyPaid),

                OverdueInstallments = list.Sum(x =>
                    x.Installments.Count(i =>
                        i.Status == InstallmentStatus.Overdue)),

                TotalCollected = list.Sum(x =>
                    x.Installments
                        .Where(i => i.Status == InstallmentStatus.Paid)
                        .Sum(i => i.Amount)),

                RemainingAmount = list.Sum(x =>
                    x.Installments
                        .Where(i => i.Status != InstallmentStatus.Paid)
                        .Sum(i => i.Amount)),
        PendingInstallments = list.Sum(x =>
                        x.Installments.Count(i =>
                        i.Status == InstallmentStatus.Pending)),
            };
        }

        // ============================================================
        // OVERDUE UPDATE (Cron Job / Admin Action)
        // ============================================================
        public async Task UpdateOverdueInstallmentsAsync()
        {
            var repo = _unitOfWork.GetRepository<Installment, int>();

            var installments = await repo.GetAllAsync(
                new OverdueInstallmentsSpecification());

            if (!installments.Any())
                return;

            var affectedAssessments = new HashSet<int>();

            foreach (var inst in installments)
            {
                inst.Status = InstallmentStatus.Overdue;
                repo.Update(inst);

                affectedAssessments.Add(inst.TaxAssessmentId);
            }

            await _unitOfWork.SaveChangesAsync();

            foreach (var id in affectedAssessments)
            {
                await _installmentService
                    .UpdateAssessmentPaymentStatusAsync(id);
            }
        }
   
   
public async Task<IEnumerable<EmployeePerformanceDto>>
GetEmployeesPerformanceAsync()
{
    var repo = _unitOfWork.GetRepository<Employee, int>();

    var employees = await repo.GetAllAsync();

    var random = new Random();

    return employees
        .Select(e => new EmployeePerformanceDto
        {
            EmployeeId = e.Id,

            EmployeeName = e.FullName,

            Department = e.Department,

            TasksDone = random.Next(1, 31),

            Score = random.Next(60, 101),

            IsActive = e.IsActive
        })
        .ToList();
}
    }
}

