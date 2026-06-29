namespace Shared.DTOS.AdminDTOs
{
    public class EmployeeDto
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

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public int CreatedBy { get; set; }

        public string CreatedByName { get; set; } = null!;

        public int UpdatedBy { get; set; }

        public string UpdatedByName { get; set; } = null!;
    }
}
