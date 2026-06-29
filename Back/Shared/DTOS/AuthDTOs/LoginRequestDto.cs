using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS.AuthDTOs
{
    public class LoginRequestDto
    {
        [Required]
        public string UsernameOrNationalId { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }
}
