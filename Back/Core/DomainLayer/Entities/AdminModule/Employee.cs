using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities.AdminModule
{
    public class Employee : BaseEntity<int>
    {
        public string EmployeeCode { get; set; } = null!;

        public string FullName { get; set; } = null!;

        public string NationalId { get; set; } = null!;

        public string JobTitle { get; set; } = null!;

        public string Department { get; set; } = null!;

        public string OfficeId { get; set; } = null!;

        public string Username { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string? PicturePath { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime? LastPasswordChangedAt { get; set; }
    }
}
