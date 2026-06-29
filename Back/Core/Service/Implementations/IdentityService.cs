using System.Security.Cryptography;
using System.Text;
using Core.DomainLayer.Contracts;
using Core.DomainLayer.Entities.AdminModule;
using Core.Service.Helpers;
using Core.ServiceAbstraction;
using Microsoft.AspNetCore.Identity;
using Shared.DTOS.AuthDTOs;

namespace Core.Service.Implementations
{
    public class IdentityService : IIdentityService
    {
        private const string RequiredCredentialsMessage = "Username or national ID and password are required.";
        private const string InvalidCredentialsMessage = "Invalid login credentials. Please check your username, national ID, and password.";
        private const string InactiveAccountMessage = "This account is inactive. Please contact the system administrator.";
        private const string SuccessMessage = "Signed in successfully.";
        private const string OtpSentMessage = "Verification code sent.";
        private const string RequiredOtpFieldsMessage = "Username and verification code are required.";
        private const string RequiredResetFieldsMessage = "Username, verification code, and new password are required.";
        private const string InvalidOtpMessage = "Invalid code.";
        private const string ExpiredOtpMessage = "Verification code expired.";
        private const string UsedOtpMessage = "Verification code has already been used.";
        private const string UnverifiedOtpMessage = "Please verify the code before resetting your password.";
        private const string OtpVerifiedMessage = "Verification code confirmed.";
        private const string InvalidPasswordMessage = "Invalid password. Use at least 8 characters with uppercase, lowercase, number, and symbol.";
        private const string PasswordResetSuccessMessage = "Password reset successfully.";

        private readonly IUnitOfWork _unitOfWork;
        private readonly INotificationService _notificationService;

        public IdentityService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
        }

        public async Task<LoginResultDto> LoginAsync(LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UsernameOrNationalId) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return Failed(RequiredCredentialsMessage);
            }

            var loginIdentifier = request.UsernameOrNationalId.Trim();
            var employees = _unitOfWork.GetRepository<Employee, int>();
            var employee = await employees.FirstOrDefaultAsync(e =>
                e.Username == loginIdentifier || e.NationalId == loginIdentifier);

            if (employee == null)
                return Failed(InvalidCredentialsMessage);

            var verificationResult = PasswordHashHelper.VerifyPassword(employee, request.Password);
            if (verificationResult == PasswordVerificationResult.Failed)
                return Failed(InvalidCredentialsMessage);

            if (!employee.IsActive)
                return Failed(InactiveAccountMessage);

            return new LoginResultDto
            {
                Succeeded = true,
                Message = SuccessMessage,
                Employee = MapToAuthenticatedEmployee(employee)
            };
        }

        public async Task<PasswordResetResultDto> RequestPasswordResetAsync(ForgotPasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                return PasswordResetResult(false, "Username is required.");

            var username = request.Username.Trim();
            var employees = _unitOfWork.GetRepository<Employee, int>();
            var employee = await employees.FirstOrDefaultAsync(e => e.Username == username);

            if (employee == null || !employee.IsActive || employee.Id <= 0)
                return PasswordResetResult(true, OtpSentMessage);

            var otp = GenerateOtp();
            var now = DateTime.UtcNow;
            var otpEntity = new PasswordResetOtp
            {
                EmployeeId = employee.Id,
                OtpHash = HashOtp(otp),
                ExpiresAt = now.AddMinutes(10),
                VerifiedAt = null,
                UsedAt = null,
                CreatedAt = now,
                UpdatedAt = now,
                CreatedBy = employee.Id,
                UpdatedBy = employee.Id
            };

            var otpRepo = _unitOfWork.GetRepository<PasswordResetOtp, int>();
            await otpRepo.AddAsync(otpEntity);
            await _unitOfWork.SaveChangesAsync();
            await _notificationService.SendPasswordResetOtpAsync(employee, otp);

            return PasswordResetResult(true, OtpSentMessage);
        }

        public async Task<PasswordResetResultDto> VerifyPasswordResetOtpAsync(VerifyOtpRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Otp))
            {
                return PasswordResetResult(false, RequiredOtpFieldsMessage);
            }

            var employees = _unitOfWork.GetRepository<Employee, int>();
            var employee = await employees.FirstOrDefaultAsync(e => e.Username == request.Username.Trim());

            if (employee == null || !employee.IsActive)
                return PasswordResetResult(false, InvalidOtpMessage);

            var otpRepo = _unitOfWork.GetRepository<PasswordResetOtp, int>();
            var matchingOtp = await FindLatestMatchingOtpAsync(otpRepo, employee.Id, request.Otp);
            var now = DateTime.UtcNow;

            var validationMessage = ValidateOtpForUse(matchingOtp, now);
            if (validationMessage != null)
                return PasswordResetResult(false, validationMessage);

            matchingOtp!.VerifiedAt = now;
            matchingOtp.UpdatedAt = now;
            matchingOtp.UpdatedBy = employee.Id;

            otpRepo.Update(matchingOtp);
            await _unitOfWork.SaveChangesAsync();

            return PasswordResetResult(true, OtpVerifiedMessage);
        }

        public async Task<PasswordResetResultDto> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Otp) ||
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return PasswordResetResult(false, RequiredResetFieldsMessage);
            }

            var employees = _unitOfWork.GetRepository<Employee, int>();
            var employee = await employees.FirstOrDefaultAsync(e => e.Username == request.Username.Trim());

            if (employee == null || !employee.IsActive)
                return PasswordResetResult(false, InvalidOtpMessage);

            var passwordValidationMessage = ValidatePasswordPolicy(request.NewPassword);
            if (passwordValidationMessage != null)
                return PasswordResetResult(false, passwordValidationMessage);

            var otpRepo = _unitOfWork.GetRepository<PasswordResetOtp, int>();
            var now = DateTime.UtcNow;
            var matchingOtp = await FindLatestMatchingOtpAsync(otpRepo, employee.Id, request.Otp);
            var validationMessage = ValidateOtpForUse(matchingOtp, now);
            if (validationMessage != null)
                return PasswordResetResult(false, validationMessage);

            if (matchingOtp!.VerifiedAt == null)
                return PasswordResetResult(false, UnverifiedOtpMessage);

            employee.PasswordHash = PasswordHashHelper.HashPassword(request.NewPassword);
            employee.LastPasswordChangedAt = now;
            employee.UpdatedAt = now;
            employee.UpdatedBy = employee.Id;

            matchingOtp.UsedAt = now;
            matchingOtp.UpdatedAt = now;
            matchingOtp.UpdatedBy = employee.Id;

            employees.Update(employee);
            otpRepo.Update(matchingOtp);
            await _unitOfWork.SaveChangesAsync();

            return PasswordResetResult(true, PasswordResetSuccessMessage);
        }

        private static LoginResultDto Failed(string message)
        {
            return new LoginResultDto
            {
                Succeeded = false,
                Message = message
            };
        }

        private static PasswordResetResultDto PasswordResetResult(bool succeeded, string message)
        {
            return new PasswordResetResultDto
            {
                Succeeded = succeeded,
                Message = message
            };
        }

        private static string GenerateOtp()
        {
            return RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        }

        private static string HashOtp(string otp)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(otp));
            return Convert.ToBase64String(bytes);
        }

        private static async Task<PasswordResetOtp?> FindLatestMatchingOtpAsync(
            IGenericRepository<PasswordResetOtp, int> otpRepo,
            int employeeId,
            string otp)
        {
            var otpHash = HashOtp(otp.Trim());
            var otps = await otpRepo.GetAllAsync();

            return otps
                .Where(o => o.EmployeeId == employeeId &&
                            o.OtpHash == otpHash)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefault();
        }

        private static string? ValidateOtpForUse(PasswordResetOtp? otp, DateTime now)
        {
            if (otp == null)
                return InvalidOtpMessage;

            if (otp.UsedAt != null)
                return UsedOtpMessage;

            if (otp.ExpiresAt < now)
                return ExpiredOtpMessage;

            return null;
        }

        private static string? ValidatePasswordPolicy(string password)
        {
            if (password.Length < 8 ||
                !password.Any(char.IsUpper) ||
                !password.Any(char.IsLower) ||
                !password.Any(char.IsDigit) ||
                !password.Any(ch => !char.IsLetterOrDigit(ch)))
            {
                return InvalidPasswordMessage;
            }

            return null;
        }

        private static AuthenticatedEmployeeDto MapToAuthenticatedEmployee(Employee employee)
        {
            return new AuthenticatedEmployeeDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                NationalId = employee.NationalId,
                JobTitle = employee.JobTitle,
                Department = employee.Department,
                OfficeId = employee.OfficeId,
                Username = employee.Username,
                Email = employee.Email,
                Phone = employee.Phone,
                PicturePath = employee.PicturePath,
                RoleNameArabic = EmployeeRoleHelper.ToArabicName(employee.Department)
            };
        }
    }
}
