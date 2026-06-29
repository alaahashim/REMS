using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Core.Service.Implementations
{
    public class ServiceManager : IServiceManager
    {
        private readonly Lazy<ILocationService> _lazyLocationService;
        private readonly Lazy<IPropertyService> _lazyPropertyService;
        private readonly Lazy<IAssignmentService> _lazyAssignmentService;
        private readonly Lazy<IOwnerService> _lazyOwnerService;
        private readonly Lazy<IEmployeeService> _lazyEmployeeService;
        private readonly Lazy<IAuditLogService> _lazyAuditLogService;
        private readonly Lazy<IIdentityService> _lazyIdentityService;
        private readonly Lazy<IFinanceService> _lazyPaymentService;
        private readonly Lazy<IExemptionService> _lazyExemptionService;
        private readonly Lazy<ITaxAssessmentService> _lazyTaxAssessmentService;
        private readonly Lazy<IAppealService> _lazyAppealService;
        private readonly Lazy<IInstallmentService> _lazyInstallmentService;

        public ServiceManager(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            INotificationService notificationService)
        {
            _lazyLocationService = new(() => new LocationService(unitOfWork));
            _lazyPropertyService = new(() => new PropertyService(unitOfWork, mapper));
            _lazyAssignmentService = new(() => new AssignmentService(unitOfWork, mapper));
            _lazyOwnerService = new(() => new OwnerService(unitOfWork, mapper));
            _lazyEmployeeService = new(() => new EmployeeService(unitOfWork, httpContextAccessor));
            _lazyAuditLogService = new(() => new AuditLogService(unitOfWork));
            _lazyIdentityService = new(() => new IdentityService(unitOfWork, notificationService));
            _lazyExemptionService = new(() => new ExemptionService(unitOfWork, mapper));
            _lazyInstallmentService = new(() => new InstallmentService(unitOfWork, mapper));
            _lazyPaymentService = new(() => new FinanceService(unitOfWork, mapper,
                _lazyInstallmentService.Value));
            _lazyTaxAssessmentService = new(() => new TaxAssessmentService(
                unitOfWork,
                mapper,
                _lazyExemptionService.Value,
                _lazyInstallmentService.Value));
            _lazyAppealService = new(() => new AppealService(unitOfWork, mapper,
                _lazyInstallmentService.Value));
        }

        public ILocationService LocationService => _lazyLocationService.Value;
        public IPropertyService PropertyService => _lazyPropertyService.Value;
        public IAssignmentService AssignmentService => _lazyAssignmentService.Value;
        public IOwnerService OwnerService => _lazyOwnerService.Value;
        public IEmployeeService EmployeeService => _lazyEmployeeService.Value;
        public IAuditLogService AuditLogService => _lazyAuditLogService.Value;
        public IIdentityService IdentityService => _lazyIdentityService.Value;
        public IFinanceService FinanceService => _lazyPaymentService.Value;
        public IExemptionService ExemptionService => _lazyExemptionService.Value;
        public ITaxAssessmentService TaxAssessmentService => _lazyTaxAssessmentService.Value;
        public IAppealService AppealService => _lazyAppealService.Value;
        public IInstallmentService InstallmentService => _lazyInstallmentService.Value;
    }
}