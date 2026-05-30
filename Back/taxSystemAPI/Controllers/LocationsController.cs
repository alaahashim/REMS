using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationsController(
            ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet("governorates")]
        public async Task<IActionResult>
            GetGovernorates()
        {
            var result =
                await _locationService
                .GetGovernoratesAsync();

            return Ok(result);
        }

        [HttpGet("centers/{govId}")]
        public async Task<IActionResult>
            GetCenters(int govId)
        {
            var result =
                await _locationService
                .GetCentersAsync(govId);

            return Ok(result);
        }

        [HttpGet("streets/{centerId}")]
        public async Task<IActionResult>
            GetStreets(int centerId)
        {
            var result =
                await _locationService
                .GetStreetsAsync(centerId);

            return Ok(result);
        }
    }
}