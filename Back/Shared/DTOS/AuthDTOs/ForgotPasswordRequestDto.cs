using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS.AuthDTOs
{
    public class ForgotPasswordRequestDto
    {
        [Required]
        public string Username { get; set; } = null!;
    }
}
