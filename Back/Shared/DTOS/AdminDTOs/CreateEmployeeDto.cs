namespace Shared.DTOS.AdminDTOs
{
    public class CreateEmployeeDto
    {
        public string EmployeeCode { get; set; } = null!;

        public string FullName { get; set; } = null!;

        // public string NationalId { get; set; } = null!;

        public string JobTitle { get; set; } = null!;

        public string Department { get; set; } = null!;

        public string OfficeId { get; set; } = null!;

        public string Username { get; set; } = null!;

        public string Password { get; set; } = null!;
    }
}
