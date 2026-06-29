using Core.DomainLayer.Entities.AdminModule;

namespace Core.Service.Helpers
{
    public static class EmployeeRoleHelper
    {
        public static string ToArabicName(string? role)
        {
            return Parse(role) switch
            {
                EmployeeRole.Admin => "مدير النظام",
                EmployeeRole.DataEntry => "مدخل بيانات",
                EmployeeRole.Reviewer => "مراجع",
                EmployeeRole.Finance => "مالي",
                EmployeeRole.Manager => "مدير مأمورية",
                EmployeeRole.Committee => "لجنة الطعون",
                _ => "موظف"
            };
        }

        private static EmployeeRole Parse(string? role)
        {
            var value = (role ?? string.Empty).Trim().ToLowerInvariant();

            if (value.Contains("admin") || value.Contains("مدير النظام"))
                return EmployeeRole.Admin;

            if ((value.Contains("data") && value.Contains("entry")) || value.Contains("مدخل"))
                return EmployeeRole.DataEntry;

            if (value.Contains("review") || value.Contains("مراجع"))
                return EmployeeRole.Reviewer;

            if (value.Contains("finance") || value.Contains("مالي"))
                return EmployeeRole.Finance;

            if (value.Contains("manager") || value.Contains("مأمورية"))
                return EmployeeRole.Manager;

            if (value.Contains("committee") || value.Contains("طعون"))
                return EmployeeRole.Committee;

            return EmployeeRole.Employee;
        }
    }
}
