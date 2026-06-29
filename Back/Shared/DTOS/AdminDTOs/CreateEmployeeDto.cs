using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS.AdminDTOs
{
    public class CreateEmployeeDto
    {
        [Required]
        public string EmployeeCode { get; set; } = null!;

        [Required]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "الرقم القومي مطلوب")]
        [RegularExpression(@"^\d{14}$", ErrorMessage = "الرقم القومي يجب أن يتكون من 14 رقم")]
        public string NationalId { get; set; } = null!;

        [Required]
        public string JobTitle { get; set; } = null!;

        [Required]
        public string Department { get; set; } = null!;

        [Required]
        public string OfficeId { get; set; } = null!;

        [Required]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "Phone number must be exactly 11 digits")]
        public string Phone { get; set; } = null!;

        public string? PicturePath { get; set; }
    }
}
