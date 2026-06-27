using Core.DomainLayer.Entities;
using Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
namespace Persistence.Data
{
   public class StoreDbContext(DbContextOptions<StoreDbContext> options):DbContext(options)
    {
        #region DbSet
        public DbSet<Governorate> Governorates { get; set; }
        public DbSet<Center> Centers { get; set; }
        public DbSet<Street> Streets { get; set; }
        public DbSet<Exemption> Exemptions { get; set; }
        public DbSet<ExemptionAttachment> ExemptionAttachments { get; set; }
        
        public DbSet<Neighborhood> Neighborhoods { get; set; }
        
        public DbSet<Property> Properties { get; set; }

        public DbSet<Unit> Units { get; set; }
        public DbSet<Owner> Owners { get; set; }

         public DbSet<RoleAssignment> RoleAssignments { get; set; }
         public DbSet<TaxRule> TaxRules { get; set; }
        public DbSet<TaxAssessment> TaxAssessments { get; set; }
        public DbSet<Appeal> Appeals { get; set; }
        public DbSet<AppealAttachment> AppealAttachments { get; set; }
        #endregion
       
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
modelBuilder.ApplyConfigurationsFromAssembly(typeof(StoreDbContext).Assembly);
            LocationSeedData.Seed(modelBuilder);

        }
    }
}