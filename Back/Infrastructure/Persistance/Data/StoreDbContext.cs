using Core.DomainLayer.Entities;
using Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Core.DomainLayer.Entities.AdminModule; // تأكدي من المسار ده (ممكن يكون مختلف عندك)
using System.Reflection;

namespace Persistence.Data
{
    public class StoreDbContext : DbContext
    {
        public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options) { }

        #region DbSet
        public DbSet<Governorate> Governorates { get; set; }
        public DbSet<Center> Centers { get; set; }
        public DbSet<Street> Streets { get; set; }
        public DbSet<Neighborhood> Neighborhoods { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Owner> Owners { get; set; }
        public DbSet<RoleAssignment> RoleAssignments { get; set; }
        public DbSet<Employee> Employees { get; set; } 
    public DbSet<AuditLog> AuditLogs { get; set; }
        // تأكدي لو عندك DbSet لـ Employee أو AuditLog ضيفيهم هنا لو مش موجودين
        #endregion

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // هذا السطر يمنع الـ Warning من التحول لـ Exception ويسمح بعمل الـ Update
            optionsBuilder.ConfigureWarnings(warnings => 
                warnings.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
            
            // تأكدي أن LocationSeedData لا تستخدم قيم ديناميكية (مثل DateTime.Now)
            LocationSeedData.Seed(modelBuilder);
        }
    }
}