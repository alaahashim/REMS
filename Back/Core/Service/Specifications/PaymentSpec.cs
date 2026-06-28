using System;
using Core.DomainLayer.Entities;
using Core.Specifications;

namespace Core.Service.Specifications
{
    // 1) TaxAssessmentSearchSpec
    public class TaxAssessmentSearchSpec
        : BaseSpecifications<TaxAssessment, int>
    {
        public TaxAssessmentSearchSpec(string search)
            : base(t =>
                 t.Status == TaxStatus.Approved
                && t.IsAvailableForCollection&&
                 t.Owner != null &&
                (
                    t.Owner.FullName.Contains(search) ||
                    t.Owner.NationalId.Contains(search)
                ))
        {
            AddInclude("Owner");
            AddInclude("Unit");
            AddInclude("Unit.Property");
AddInclude("Installments");
AddInclude("Installments.Payments");            AddInclude("Installments.Payments");
        }
    }

    // 2) TaxAssessmentByIdForPaymentSpec
    public class TaxAssessmentByIdForPaymentSpec
        : BaseSpecifications<TaxAssessment, int>
    {
        public TaxAssessmentByIdForPaymentSpec(int assessmentId)
            : base(t => t.Id == assessmentId)
        {
            AddInclude("Owner");
            AddInclude("Unit");
AddInclude("Installments");
AddInclude("Installments.Payments");            AddInclude("Installments.Payments");
        }
    }

    // 3) InstallmentByIdSpec
    public class InstallmentByIdSpec
        : BaseSpecifications<Installment, int>
    {
        public InstallmentByIdSpec(int installmentId)
            : base(i => i.Id == installmentId)
        {
            AddInclude("TaxAssessment");
            AddInclude("Payments");
        }
    }

    // 4) InstallmentsByAssessmentSpec
    public class InstallmentsByAssessmentSpec
        : BaseSpecifications<Installment, int>
    {
        public InstallmentsByAssessmentSpec(int assessmentId)
            : base(i => i.TaxAssessmentId == assessmentId)
        {
            AddInclude("Payments");
        }
    }

    // 5) OverdueInstallmentsSpec
    

    // 6) PaymentsByDateSpecification
    public class PaymentsByDateSpecification
        : BaseSpecifications<Payment, int>
    {
        public PaymentsByDateSpecification(DateTime from, DateTime to)
            : base(p =>
                p.PaymentDate >= from &&
                p.PaymentDate <= to)
        {
AddInclude("Installments");
AddInclude("Installments.Payments");
            AddInclude("Installment.TaxAssessment");
            AddInclude("Installment.TaxAssessment.Owner");
        }
    }

     public class PendingInstallmentsSpec
        : BaseSpecifications<Installment, int>
    {
        public PendingInstallmentsSpec(int assessmentId)
            : base(i =>
                i.TaxAssessmentId == assessmentId &&
                i.Status == InstallmentStatus.Pending)
        {
            AddInclude("Payments");
        }
    }

    public class TaxAssessmentWithInstallmentsSpec
    : BaseSpecifications<TaxAssessment, int>
{
    public TaxAssessmentWithInstallmentsSpec(int assessmentId)
        : base(t => t.Id == assessmentId)
    {
AddInclude("Installments");
AddInclude("Installments.Payments");    }
}


  
          public class InstallmentsForPaymentSpecification
    : BaseSpecifications<Installment, int>
{
    public InstallmentsForPaymentSpecification(IEnumerable<int> installmentIds)
        : base(i => installmentIds.Contains(i.Id))
    {
        AddInclude("Payments");

        AddInclude("TaxAssessment");

        AddInclude("TaxAssessment.Owner");

        AddInclude("TaxAssessment.Unit");

        AddInclude("TaxAssessment.Unit.Property");

        AddInclude("TaxAssessment.Unit.Property.Governorate");

        AddInclude("TaxAssessment.Unit.Property.Neighborhood");

        AddInclude("TaxAssessment.Unit.Property.Neighborhood.Center");
    }
}
    public class PaymentHistorySpecification
        : BaseSpecifications<Payment, int>
    {
        public PaymentHistorySpecification(int pageIndex = 1, int pageSize = 8)
    {
        AddOrderByDescending(x => x.PaymentDate);

        ApplyPagination(pageSize, pageIndex);
AddInclude("Installment");

AddInclude("Installment.TaxAssessment");

AddInclude("Installment.TaxAssessment.Owner");

AddInclude("Installment.TaxAssessment.Unit");

AddInclude("Installment.TaxAssessment.Unit.Property");

AddInclude("Installment.TaxAssessment.Unit.Property.Governorate");

AddInclude("Installment.TaxAssessment.Unit.Property.Neighborhood");

AddInclude("Installment.TaxAssessment.Unit.Property.Neighborhood.Center");
        }
    }
    public class PaymentHistoryCountSpecification
    : BaseSpecifications<Payment, int>
{
    public PaymentHistoryCountSpecification() { }
}

    public class DashboardAssessmentSpecification
        : BaseSpecifications<TaxAssessment, int>
    {
        public DashboardAssessmentSpecification()
        {
AddInclude("Installments");
AddInclude("Installments.Payments");        }
    }

     public class OverdueInstallmentsSpecification
        : BaseSpecifications<Installment, int>
    {
        public OverdueInstallmentsSpecification()
           : base(i =>

   i.Status == InstallmentStatus.Pending
&& i.DueDate.Date < DateTime.UtcNow.Date
&& i.TaxAssessment.Status == TaxStatus.Approved
&& i.TaxAssessment.IsAvailableForCollection)
        {
AddInclude("TaxAssessment");
        }
    }

     public class PaymentReceiptSpecification
        : BaseSpecifications<Payment, int>
    {
        public PaymentReceiptSpecification(int paymentId)
            : base(p => p.Id == paymentId)
        {
AddInclude("Installments");
AddInclude("Installments.Payments");
            AddInclude("Installment.TaxAssessment");

            AddInclude("Installment.TaxAssessment.Owner");

            AddInclude("Installment.TaxAssessment.Unit");

            AddInclude("Installment.TaxAssessment.Unit.Property");

            AddInclude("Installment.TaxAssessment.Unit.Property.Governorate");

            AddInclude("Installment.TaxAssessment.Unit.Property.Neighborhood");
        }
    }


    public class PaymentReceiptNumberSpecification
        : BaseSpecifications<Payment, int>
    {
        public PaymentReceiptNumberSpecification(string receiptNo)
            : base(p => p.ReceiptNo == receiptNo)
        {

        }
    }

  public class FinanceSearchSpecification
    : BaseSpecifications<TaxAssessment, int>
{
    public FinanceSearchSpecification(string search)
        : base(x =>
            x.Status == TaxStatus.Approved
            &&
            (
                x.Owner!.NationalId.Contains(search) ||
                x.Owner.FullName.Contains(search)
            ))
    {
        AddOrderByDescending(x => x.TaxYear);

        AddInclude("Owner");
        AddInclude("Unit");
        AddInclude("Unit.Property");
        AddInclude("Unit.Property.Governorate");
        AddInclude("Unit.Property.Neighborhood");
        AddInclude("Unit.Property.Neighborhood.Center");
        AddInclude("Installments");
        AddInclude("Installments.Payments");
    }
}
 
}