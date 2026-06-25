namespace Core.DomainLayer.Entities
{
public enum TaxStatus
{
    PendingCalculation = 1,  // بانتظار الحساب
    Approved           = 2   // معتمد
}
// Shared/Enums/PayerType.cs
public enum PayerType
{
    Owner  = 1,
    Tenant = 2
}

// Shared/Enums/PaymentPlan.cs
public enum PaymentPlan
{
    Full          = 1,
    Installment_2 = 2
}}