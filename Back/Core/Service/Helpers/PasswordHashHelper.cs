using Core.DomainLayer.Entities.AdminModule;
using Microsoft.AspNetCore.Identity;

namespace Core.Service.Helpers
{
    public static class PasswordHashHelper
    {
        public static string HashPassword(string plainPassword)
        {
            var passwordHasher = new PasswordHasher<Employee>();
            return passwordHasher.HashPassword(new Employee(), plainPassword);
        }

        public static PasswordVerificationResult VerifyPassword(Employee employee, string plainPassword)
        {
            var passwordHasher = new PasswordHasher<Employee>();
            return passwordHasher.VerifyHashedPassword(employee, employee.PasswordHash, plainPassword);
        }
    }
}
