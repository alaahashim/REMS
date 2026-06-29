using Core.DomainLayer.Entities.AdminModule;

namespace Core.ServiceAbstraction
{
    public interface INotificationService
    {
        Task SendPasswordResetOtpAsync(Employee employee, string otp);
    }
}
