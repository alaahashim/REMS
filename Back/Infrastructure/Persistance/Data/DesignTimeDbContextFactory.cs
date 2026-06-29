using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Persistence.Data
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<StoreDbContext>
    {
        public StoreDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<StoreDbContext>();

            optionsBuilder.UseSqlServer(
                "Server=.\\SQLEXPRESS;Database=TaxSystemDB;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;");

            return new StoreDbContext(optionsBuilder.Options);
        }
    }
}
