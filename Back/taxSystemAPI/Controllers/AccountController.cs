using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Shared.DTOS.AuthDTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private const string AuthConfigurationMessage =
            "\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u063a\u064a\u0631 \u0645\u0643\u062a\u0645\u0644\u0629. \u064a\u0631\u062c\u0649 \u0645\u0631\u0627\u062c\u0639\u0629 \u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0646\u0638\u0627\u0645.";

        private readonly IServiceManager _serviceManager;
        private readonly IConfiguration _configuration;

        public AccountController(IServiceManager serviceManager, IConfiguration configuration)
        {
            _serviceManager = serviceManager;
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var loginResult = await _serviceManager.IdentityService.LoginAsync(request);

            if (!loginResult.Succeeded || loginResult.Employee == null)
                return Unauthorized(new { message = loginResult.Message });

            var expiresAt = DateTime.UtcNow.AddMinutes(GetExpirationMinutes());
            var token = GenerateJwtToken(loginResult.Employee, expiresAt);

            return Ok(new LoginResponseDto
            {
                Message = loginResult.Message,
                Token = token,
                ExpiresAt = expiresAt,
                Employee = loginResult.Employee
            });
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> Profile()
        {
            var employeeIdClaim =
                User.FindFirstValue(ClaimTypes.NameIdentifier) ??
                User.FindFirstValue("employeeId") ??
                User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (!int.TryParse(employeeIdClaim, out var employeeId))
                return Unauthorized(new { message = "Invalid token." });

            var employee = await _serviceManager.EmployeeService.GetEmployeeByIdAsync(employeeId);

            if (employee == null)
                return NotFound(new { message = "Employee not found" });

            return Ok(employee);
        }

        [AllowAnonymous]
        [HttpPost("forgot-password-request")]
        public async Task<IActionResult> ForgotPasswordRequest([FromBody] ForgotPasswordRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _serviceManager.IdentityService.RequestPasswordResetAsync(request);
            return result.Succeeded
                ? Ok(new { message = result.Message })
                : BadRequest(new { message = result.Message });
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            return await ForgotPasswordRequest(request);
        }

        [AllowAnonymous]
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _serviceManager.IdentityService.VerifyPasswordResetOtpAsync(request);
            return result.Succeeded
                ? Ok(new { message = result.Message })
                : BadRequest(new { message = result.Message });
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _serviceManager.IdentityService.ResetPasswordAsync(request);
            return result.Succeeded
                ? Ok(new { message = result.Message })
                : BadRequest(new { message = result.Message });
        }

        private string GenerateJwtToken(AuthenticatedEmployeeDto employee, DateTime expiresAt)
        {
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var secretKey =
                _configuration["Jwt:Key"] ??
                _configuration["Jwt:SecretKey"];

            if (string.IsNullOrWhiteSpace(issuer) ||
                string.IsNullOrWhiteSpace(audience) ||
                string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException(AuthConfigurationMessage);
            }

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, employee.Id.ToString()),
                new(ClaimTypes.NameIdentifier, employee.Id.ToString()),
                new("employeeId", employee.Id.ToString()),
                new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new(JwtRegisteredClaimNames.UniqueName, employee.Username),
                new(ClaimTypes.Name, employee.FullName),
                new("employeeCode", employee.EmployeeCode),
                new("nationalId", employee.NationalId),
                new("department", employee.Department),
                new("officeId", employee.OfficeId),
                new(ClaimTypes.Role, employee.JobTitle)
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private int GetExpirationMinutes()
        {
            var configuredValue =
                _configuration["Jwt:ExpiresInMinutes"] ??
                _configuration["Jwt:ExpirationMinutes"];

            return int.TryParse(configuredValue, out var expirationMinutes) && expirationMinutes > 0
                ? expirationMinutes
                : 120;
        }
    }
}
