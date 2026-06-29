namespace Shared.DTOS.AuthDTOs
{
    public class LoginResultDto
    {
        public bool Succeeded { get; set; }

        public string Message { get; set; } = null!;

        public AuthenticatedEmployeeDto? Employee { get; set; }
    }
}
