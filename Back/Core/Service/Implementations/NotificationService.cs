using Core.DomainLayer.Entities.AdminModule;
using Core.ServiceAbstraction;

namespace Core.Service.Implementations
{
    public class NotificationService : INotificationService
    {
        public Task SendPasswordResetOtpAsync(Employee employee, string otp)
        {
            Console.WriteLine($"[PasswordResetOtp] User={employee.Username}, EmployeeId={employee.Id}, OTP={otp}, ExpiresInMinutes=10");
            return Task.CompletedTask;
        }
    }
}
