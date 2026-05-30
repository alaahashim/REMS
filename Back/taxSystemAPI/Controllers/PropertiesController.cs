using Microsoft.AspNetCore.Mvc;
using Core.ServiceAbstraction;
using Shared.DTOS;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController(
        IServiceManager service)
        : ControllerBase
    {

        // =========================
        // 1- Add Property + Units
        // =========================

        [HttpPost]
        public async Task<IActionResult>
            AddProperty(
            [FromBody]
            CreatePropertyWithUnitsDto dto)
        {
            var id =
                await service
                .PropertyService
                .AddPropertyAsync(dto);

            return Ok(new
            {
                success = true,
                propertyId = id,
                message =
                    $"تم إضافة المبنى و {dto.Units.Count} وحدات"
            });
        }


        // =========================
        // 2- Add Unit
        // =========================

        [HttpPost("unit")]
        public async Task<IActionResult>
            AddUnit(
            [FromBody]
            UnitDto dto)
        {
            await service
                .PropertyService
                .AddUnitAsync(dto);

            return Ok(new
            {
                success = true,
                message = "تم إضافة الوحدة"
            });
        }


        // =========================
        // 3- Get Properties
        // =========================

        [HttpGet]
        public async Task<IActionResult>
            GetProperties()
        {
            var result =
                await service
                .PropertyService
                .GetPropertiesAsync();

            return Ok(result);
        }


        // =========================
        // 4- Get Units
        // =========================

        [HttpGet("units")]
        public async Task<IActionResult>
            GetUnits(
            [FromQuery]
            int? propertyId)
        {
            var result =
                await service
                .PropertyService
                .GetUnitsAsync(propertyId);

            return Ok(result);
        }


        // =========================
        // 5- Delete Property
        // =========================

        [HttpDelete("{propertyId}")]
        public async Task<IActionResult>
            DeleteProperty(
            int propertyId)
        {
            await service
                .PropertyService
                .DeletePropertyAsync(propertyId);

            return Ok(new
            {
                success = true,
                message =
                    "تم حذف العقار والوحدات المرتبطة"
            });
        }


        // =========================
        // 6- Update Status
        // =========================

        [HttpPut("{id}/status")]
        public async Task<IActionResult>
            UpdateStatus(
            int id,
            [FromBody]
            UpdateStatusDto dto)
        {
            await service
                .PropertyService
                .UpdatePropertyStatusAsync(
                    id,
                    dto.Status);

            return Ok(new
            {
                success = true,
                message =
                    "تم تحديث حالة العقار"
            });
        }
    }


    // =========================
    // DTO For Status Update
    // =========================

    public class UpdateStatusDto
    {
        public string Status { get; set; }
    }
}