using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
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
            var installmentRepo = _unitOfWork.GetRepository<Installment, int>();
            var paymentRepo = _unitOfWork.GetRepository<Payment, int>();

            // -------------------------
            // تحقق من الإيصال
            // -------------------------
            var existingReceipt = await paymentRepo.FirstOrDefaultAsync(
                new PaymentReceiptNumberSpecification(dto.ReceiptNo));

           if (existingReceipt != null)
    throw new BusinessException("رقم الإيصال مستخدم بالفعل.");

            // -------------------------
            // جلب القسط
            // -------------------------
            var installment = await installmentRepo.FirstOrDefaultAsync(
                new InstallmentForPaymentSpecification(dto.InstallmentId));

                    if (installment == null)
    throw new NotFoundException("القسط غير موجود.");
if (installment.Status == InstallmentStatus.Paid)
    throw new BusinessException("هذا القسط تم سداده بالفعل.");
if (dto.PaidAmount != installment.Amount)
    throw new ValidationException(new List<string>
    {
        "قيمة السداد لا تطابق قيمة القسط"
    });

            // -------------------------
            // إنشاء Payment
            // -------------------------
            var payment = new Payment
            {
                InstallmentId = installment.Id,
                PaidAmount = dto.PaidAmount,
                PaymentDate = dto.PaymentDate,
                ReceiptNo = dto.ReceiptNo,
                Method = dto.Method,
                EmployeeId = dto.EmployeeId,
                Notes = dto.Notes
            };

            await paymentRepo.AddAsync(payment);

            // -------------------------
            // تحديث القسط
            // -------------------------
            installment.Status = InstallmentStatus.Paid;
            installmentRepo.Update(installment);

            await _unitOfWork.SaveChangesAsync();

            // -------------------------
            // تحديث حالة التقييم
            // -------------------------
            await _installmentService.UpdateAssessmentPaymentStatusAsync(
                installment.TaxAssessmentId);

            // -------------------------
            // إعادة الإيصال (للطباعة)
            // -------------------------
            var receipt = await paymentRepo.FirstOrDefaultAsync(
                new PaymentReceiptSpecification(payment.Id));

            return _mapper.Map<PaymentReceiptDto>(receipt);
        }

        // ============================================================
        // PAYMENT HISTORY (للـ Front-end table)
        // ============================================================
        public async Task<IEnumerable<PaymentHistoryDto>> GetPaymentHistoryAsync()
        {
            var repo = _unitOfWork.GetRepository<Payment, int>();

            var payments = await repo.GetAllAsync(
                new PaymentHistorySpecification());

            return _mapper.Map<IEnumerable<PaymentHistoryDto>>(payments);
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
                        .Sum(i => i.Amount))
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
    }
}