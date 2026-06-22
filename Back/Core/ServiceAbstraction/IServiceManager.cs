namespace Core.ServiceAbstraction
{
    public interface IServiceManager
    {
        ILocationService LocationService { get; }

        IPropertyService PropertyService { get; }

        IAssignmentService AssignmentService { get; }
            IOwnerService OwnerService { get; }
          IEmployeeService EmployeeService { get; }
    IAuditLogService AuditLogService { get;}// ضيفي السطر ده هنا

    }
}