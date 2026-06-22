using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.ServiceAbstraction;
using Microsoft.Extensions.Configuration;

namespace Core.Service.Implementations
{
    public class ServiceManager : IServiceManager
    {
        private readonly Lazy<ILocationService> _lazyLocationService;
        private readonly Lazy<IPropertyService> _lazyPropertyService;
        private readonly Lazy<IAssignmentService> _lazyAssignmentService;
        private readonly Lazy<IOwnerService> _lazyOwnerService;
        private readonly Lazy<IEmployeeService> _employeeService;
        private readonly Lazy<IAuditLogService> _auditLogService;

        public ServiceManager(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
        {
            // الخدمات الأساسية
            _lazyLocationService = new(() => new LocationService(unitOfWork));
            _lazyPropertyService = new(() => new PropertyService(unitOfWork, mapper));
            _lazyAssignmentService = new(() => new AssignmentService(unitOfWork, mapper));
            _lazyOwnerService = new(() => new OwnerService(unitOfWork, mapper));
            
            // الخدمات الخاصة بيكي
            _employeeService = new(() => new EmployeeService(unitOfWork));
            _auditLogService = new(() => new AuditLogService(unitOfWork));
        }

        // تنفيذ الـ Interface Properties
        public ILocationService LocationService => _lazyLocationService.Value;
        public IPropertyService PropertyService => _lazyPropertyService.Value;
        public IAssignmentService AssignmentService => _lazyAssignmentService.Value;
        public IOwnerService OwnerService => _lazyOwnerService.Value;
        public IEmployeeService EmployeeService => _employeeService.Value;
        public IAuditLogService AuditLogService => _auditLogService.Value;
    }
}