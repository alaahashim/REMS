using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
 public class RoleAssignmentConfiguration : IEntityTypeConfiguration<RoleAssignment>
{
    public void Configure(EntityTypeBuilder<RoleAssignment> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.RoleType).IsRequired();
        builder.Property(x => x.ShareType).IsRequired();

       

        builder.HasOne(x => x.Owner)
               .WithMany(x => x.Assignments)
               .HasForeignKey(x => x.OwnerId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Unit)
               .WithMany()
               .HasForeignKey(x => x.UnitId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
}