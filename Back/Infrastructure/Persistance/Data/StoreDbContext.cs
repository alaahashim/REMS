using Core.DomainLayer.Entities;
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
        public DbSet<Property> Properties { get; set; }

        public DbSet<Unit> Units { get; set; }
        #endregion
       
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}