using AutoMapper;
using Core.DomainLayer.Contracts;
using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Core.Service.Implementations
{
    public class ServiceManager(
        IUnitOfWork unitOfWork,
        IMapper mapper,
       // UserManager<ApplicationUser> userManager,
        IConfiguration configuration
    ) : IServiceManager
    {
        private readonly Lazy<ILocationService> _lazyLocationService =
            new(() => new LocationService(unitOfWork));

        private readonly Lazy<IPropertyService> _lazyPropertyService =
            new(() => new PropertyService(unitOfWork, mapper));

        // لو عندك AuthenticationService
        /*
        private readonly Lazy<IAuthenticationService> _lazyAuthenticationService =
            new(() => new AuthenticationService(userManager, configuration, mapper));
        */

        public ILocationService LocationService
            => _lazyLocationService.Value;

        public IPropertyService PropertyService
            => _lazyPropertyService.Value;

        /*
        public IAuthenticationService AuthenticationService
            => _lazyAuthenticationService.Value;
        */
    }
}