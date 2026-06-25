using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.ServiceAbstraction;
using Microsoft.Extensions.Configuration;

namespace Core.Service.Implementations
{
    public class ServiceManager : IServiceManager
    {
        private readonly Lazy<ILocationService>      _lazyLocationService;
        private readonly Lazy<IPropertyService>      _lazyPropertyService;
        private readonly Lazy<IAssignmentService>    _lazyAssignmentService;
        private readonly Lazy<IOwnerService>         _lazyOwnerService;
        private readonly Lazy<IExemptionService>     _lazyExemptionService;
        private readonly Lazy<ITaxAssessmentService> _lazyTaxAssessmentService;

        public ServiceManager(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IConfiguration configuration)
        {
            _lazyLocationService   = new(() => new LocationService(unitOfWork));
            _lazyPropertyService   = new(() => new PropertyService(unitOfWork, mapper));
            _lazyAssignmentService = new(() => new AssignmentService(unitOfWork, mapper));
            _lazyOwnerService      = new(() => new OwnerService(unitOfWork, mapper));
            _lazyExemptionService  = new(() => new ExemptionService(unitOfWork, mapper));

            // this متاح هنا لأننا داخل الـ constructor
            _lazyTaxAssessmentService = new(() => new TaxAssessmentService(
                unitOfWork,
                mapper,
                this));
        }

        public ILocationService      LocationService      => _lazyLocationService.Value;
        public IPropertyService      PropertyService      => _lazyPropertyService.Value;
        public IAssignmentService    AssignmentService    => _lazyAssignmentService.Value;
        public IOwnerService         OwnerService         => _lazyOwnerService.Value;
        public IExemptionService     ExemptionService     => _lazyExemptionService.Value;
        public ITaxAssessmentService TaxAssessmentService => _lazyTaxAssessmentService.Value;
    }
}