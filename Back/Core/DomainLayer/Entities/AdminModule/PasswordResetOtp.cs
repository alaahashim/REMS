using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities.AdminModule
{
    public class PasswordResetOtp : BaseEntity<int>
    {
        public int EmployeeId { get; set; }

        public string OtpHash { get; set; } = null!;

        public DateTime ExpiresAt { get; set; }

        public DateTime? VerifiedAt { get; set; }

        public DateTime? UsedAt { get; set; }

        public Employee Employee { get; set; } = null!;
    }
}
