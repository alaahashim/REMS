namespace Shared.DTOS.AuthDTOs
{
    public class AuthenticatedEmployeeDto
    {
        public int Id { get; set; }

        public string EmployeeCode { get; set; } = null!;

        public string FullName { get; set; } = null!;

        public string NationalId { get; set; } = null!;

        public string JobTitle { get; set; } = null!;

        public string Department { get; set; } = null!;

        public string OfficeId { get; set; } = null!;

        public string Username { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string? PicturePath { get; set; }

        public string RoleNameArabic { get; set; } = null!;
    }
}
