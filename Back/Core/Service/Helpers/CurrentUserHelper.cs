using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace Core.Service.Helpers
{
    public static class CurrentUserHelper
    {
        public static int GetCurrentEmployeeId(IHttpContextAccessor httpContextAccessor, int fallbackId = 1)
        {
            var user = httpContextAccessor.HttpContext?.User;
            var userIdClaim =
                user?.FindFirstValue(ClaimTypes.NameIdentifier) ??
                user?.FindFirstValue("employeeId") ??
                user?.FindFirstValue("EmployeeId") ??
                user?.FindFirstValue("sub");

            return int.TryParse(userIdClaim, out var employeeId) ? employeeId : fallbackId;
        }
    }
}
