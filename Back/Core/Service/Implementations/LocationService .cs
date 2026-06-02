using Core.DomainLayer.Entities;
using Core.DomainLayer.Contracts;
using Core.Specifications;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Core.Service.Implementations
{
    public class LocationService : ILocationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public LocationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<GovernorateDto>>
            GetGovernoratesAsync()
        {
            var repo = _unitOfWork
                .GetRepository<Governorate, int>();

            var data = await repo.GetAllAsync();

            return data.Select(g => new GovernorateDto
            {
                Id = g.Id,
                Name = g.Name
            });
        }

        public async Task<IEnumerable<CenterDto>>
            GetCentersAsync(int govId)
        {
            var spec =
                new CenterByGovernorateSpecification(govId);

            var repo = _unitOfWork
                .GetRepository<Center, int>();

            var data = await repo.GetAllAsync(spec);

            return data.Select(c => new CenterDto
            {
                Id = c.Id,
                Name = c.Name
            });
        }

        public async Task<IEnumerable<StreetDto>>
            GetStreetsAsync(int centerId)
        {
            var spec =
                new StreetByCenterSpecification(centerId);

            var repo = _unitOfWork
                .GetRepository<Street, int>();

            var data = await repo.GetAllAsync(spec);

            return data.Select(s => new StreetDto
            {
                Id = s.Id,
                Name = s.Name
            });
        }

        // ✅ جديد: الحصول على الأحياء
        public async Task<IEnumerable<NeighborhoodDto>>
            GetNeighborhoodsAsync(int centerId)
        {
            var repo = _unitOfWork
                .GetRepository<Neighborhood, int>();

            var data = await repo.GetAllAsync();

            // تصفية حسب CenterId
            var neighborhoods = data
                .Where(n => n.CenterId == centerId)
                .Select(n => new NeighborhoodDto
                {
                    Id = n.Id,
                    CenterId = n.CenterId,
                    Name = n.Name,
                    Zone = n.Zone
                });

            return neighborhoods;
        }
    }
}