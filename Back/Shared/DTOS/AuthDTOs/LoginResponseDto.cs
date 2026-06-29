namespace Shared.DTOS.AuthDTOs
{
    public class LoginResponseDto
    {
        public string Message { get; set; } = null!;

        public string Token { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        public AuthenticatedEmployeeDto Employee { get; set; } = null!;
    }
}
