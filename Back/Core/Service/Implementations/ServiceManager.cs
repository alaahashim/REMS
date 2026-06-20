using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.ServiceAbstraction;
using Microsoft.Extensions.Configuration;

namespace Core.Service.Implementations
{
    public class ServiceManager(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IConfiguration configuration
    ) : IServiceManager
    {
        private readonly Lazy<ILocationService> _lazyLocationService =
            new(() => new LocationService(unitOfWork));

        private readonly Lazy<IPropertyService> _lazyPropertyService =
            new(() => new PropertyService(unitOfWork, mapper));

       private readonly Lazy<IAssignmentService> _lazyAssignmentService =
           new(() => new AssignmentService(unitOfWork, mapper));

private readonly Lazy<IOwnerService>_lazyOwnerService =
        new(() => new OwnerService( unitOfWork, mapper));

        public ILocationService LocationService
            => _lazyLocationService.Value;

        public IPropertyService PropertyService
            => _lazyPropertyService.Value;

       public IAssignmentService AssignmentService
           => _lazyAssignmentService.Value;

      public IOwnerService OwnerService
                => _lazyOwnerService.Value;
    }
}