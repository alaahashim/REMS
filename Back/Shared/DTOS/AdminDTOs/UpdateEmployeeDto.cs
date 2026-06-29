using System.ComponentModel.DataAnnotations;

namespace Shared.DTOS.AdminDTOs
{
    public class UpdateEmployeeDto
    {
        public string? FullName { get; set; }

        [Required(ErrorMessage = "الرقم القومي مطلوب")]
        [RegularExpression(@"^\d{14}$", ErrorMessage = "الرقم القومي يجب أن يتكون من 14 رقم")]
        public string NationalId { get; set; } = null!;

        public string? JobTitle { get; set; }

        public string? Department { get; set; }

        public string? OfficeId { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [RegularExpression(@"^\d{11}$", ErrorMessage = "Phone number must be exactly 11 digits")]
        public string? Phone { get; set; }

        public string? PicturePath { get; set; }
    }
}
