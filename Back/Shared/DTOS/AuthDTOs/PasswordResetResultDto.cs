namespace Shared.DTOS.AuthDTOs
{
    public class PasswordResetResultDto
    {
        public bool Succeeded { get; set; }

        public string Message { get; set; } = null!;
    }
}
