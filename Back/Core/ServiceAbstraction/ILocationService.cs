using Shared.DTOS;

namespace Core.ServiceAbstraction
{
    public interface ILocationService
    {
        Task<IEnumerable<GovernorateDto>>
            GetGovernoratesAsync();

        Task<IEnumerable<CenterDto>>
            GetCentersAsync(int govId);

        Task<IEnumerable<StreetDto>>
            GetStreetsAsync(int centerId);
    }
}