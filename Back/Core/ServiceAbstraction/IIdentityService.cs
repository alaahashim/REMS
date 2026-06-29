using Shared.DTOS.AuthDTOs;

namespace Core.ServiceAbstraction
{
    public interface IIdentityService
    {
        Task<LoginResultDto> LoginAsync(LoginRequestDto request);

        Task<PasswordResetResultDto> RequestPasswordResetAsync(ForgotPasswordRequestDto request);

        Task<PasswordResetResultDto> VerifyPasswordResetOtpAsync(VerifyOtpRequestDto request);

        Task<PasswordResetResultDto> ResetPasswordAsync(ResetPasswordRequestDto request);
    }
}
