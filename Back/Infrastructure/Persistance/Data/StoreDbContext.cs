using Core.DomainLayer.Entities;
using Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using Core.DomainLayer.Entities.AdminModule;
using System.Reflection;

namespace Persistence.Data
{
    public class StoreDbContext : DbContext
    {
        public StoreDbContext(DbContextOptions<StoreDbContext> options)
            : base(options)
        {
        }

        #region DbSet

        public DbSet<Governorate> Governorates { get; set; }
        public DbSet<Center> Centers { get; set; }
        public DbSet<Street> Streets { get; set; }
        public DbSet<Neighborhood> Neighborhoods { get; set; }

        public DbSet<Property> Properties { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Owner> Owners { get; set; }
        public DbSet<RoleAssignment> RoleAssignments { get; set; }

        // Admin Module
        public DbSet<Employee> Employees { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        // Exemption Module
        public DbSet<Exemption> Exemptions { get; set; }
        public DbSet<ExemptionAttachment> ExemptionAttachments { get; set; }

        // Tax Module
        public DbSet<TaxRule> TaxRules { get; set; }
        public DbSet<TaxAssessment> TaxAssessments { get; set; }

        // Appeal Module
        public DbSet<Appeal> Appeals { get; set; }
        public DbSet<AppealAttachment> AppealAttachments { get; set; }

        #endregion

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // يمنع الـ PendingModelChangesWarning من التحول إلى Exception
            optionsBuilder.ConfigureWarnings(warnings =>
                warnings.Ignore(
                    Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            LocationSeedData.Seed(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }
    }
}