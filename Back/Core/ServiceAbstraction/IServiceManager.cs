namespace Core.ServiceAbstraction
{
    public interface IServiceManager
    {
        ILocationService LocationService { get; }

        IPropertyService PropertyService { get; }
        IInstallmentService InstallmentService { get; }
        IAssignmentService AssignmentService { get; }
        IFinanceService FinanceService { get; }
        IOwnerService OwnerService { get; }

        IEmployeeService EmployeeService { get; }

        IAuditLogService AuditLogService { get; }

        IExemptionService ExemptionService { get; }

        ITaxAssessmentService TaxAssessmentService { get; }

        IAppealService AppealService { get; }
    }
}