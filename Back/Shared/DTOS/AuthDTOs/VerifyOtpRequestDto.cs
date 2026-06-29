using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS.AuthDTOs
{
    public class VerifyOtpRequestDto
    {
        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Otp { get; set; } = null!;
    }
}
