using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities;
using Core.Service.Specifications;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class InstallmentService : IInstallmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public InstallmentService(
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }





public async Task<bool> HasInstallmentsAsync(int assessmentId)
{
    var repo = _unitOfWork.GetRepository<Installment, int>();

    var spec = new InstallmentsByAssessmentSpec(assessmentId);

    var installments = await repo.GetAllAsync(spec);

    return installments.Any();
}


public async Task<IEnumerable<InstallmentDto>>  GetByAssessmentIdAsync(int assessmentId)
{
    var repo = _unitOfWork.GetRepository<Installment, int>();

    var spec = new InstallmentsByAssessmentSpec(assessmentId);

    var installments = await repo.GetAllAsync(spec);

    return _mapper.Map<IEnumerable<InstallmentDto>>(installments);
}


public async Task<IEnumerable<InstallmentDto>> GetPendingByAssessmentIdAsync(int assessmentId)
{
    var repo = _unitOfWork.GetRepository<Installment, int>();

    var spec = new PendingInstallmentsSpec(assessmentId);

    var installments = await repo.GetAllAsync(spec);

    return _mapper.Map<IEnumerable<InstallmentDto>>(installments);
}


public async Task GenerateInstallmentsAsync(int assessmentId)
{
    var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();
    var installmentRepo = _unitOfWork.GetRepository<Installment, int>();

    var assessment = await assessmentRepo.FirstOrDefaultAsync(
        new TaxAssessmentByIdForPaymentSpec(assessmentId));

    if (assessment == null)
        throw new Exception("التقييم الضريبي غير موجود.");

    if (assessment.Status != TaxStatus.Approved)
        throw new Exception("لا يمكن إنشاء الأقساط قبل اعتماد التقييم.");

    if (await HasInstallmentsAsync(assessmentId))
        return;

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

    // ← هنا SaveChanges ضرورية لأن المستدعي (ApproveCalculationAsync)
    // حفظ بالفعل ثم استدعانا — نحن مسؤولون عن حفظ الأقساط
    await _unitOfWork.SaveChangesAsync();
}
  public async Task UpdateAssessmentPaymentStatusAsync(int assessmentId)
{
    var assessmentRepo = _unitOfWork.GetRepository<TaxAssessment, int>();

    var spec = new TaxAssessmentWithInstallmentsSpec(assessmentId);

    var assessment = await assessmentRepo.FirstOrDefaultAsync(spec);

    if (assessment == null)
        throw new Exception("التقييم الضريبي غير موجود.");

    var installments = assessment.Installments.ToList();

    if (!installments.Any())
    {
        assessment.PaymentStatus = PaymentStatus.Pending;

        assessmentRepo.Update(assessment);

        await _unitOfWork.SaveChangesAsync();

        return;
    }

    // جميع الأقساط مدفوعة
    if (installments.All(i => i.Status == InstallmentStatus.Paid))
    {
        assessment.PaymentStatus = PaymentStatus.Paid;
    }

    // يوجد قسط متأخر
    else if (installments.Any(i => i.Status == InstallmentStatus.Overdue))
    {
        assessment.PaymentStatus = PaymentStatus.Overdue;
    }

    // يوجد جزء مدفوع وجزء لم يدفع
    else if (installments.Any(i => i.Status == InstallmentStatus.Paid))
    {
        assessment.PaymentStatus = PaymentStatus.PartiallyPaid;
    }

    // جميعها Pending
    else
    {
        assessment.PaymentStatus = PaymentStatus.Pending;
    }

    assessmentRepo.Update(assessment);

    await _unitOfWork.SaveChangesAsync();
}  }
}