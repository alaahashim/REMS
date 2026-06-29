using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS.AuthDTOs
{
    public class ResetPasswordRequestDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Otp { get; set; } = null!;

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = null!;
    }
}
