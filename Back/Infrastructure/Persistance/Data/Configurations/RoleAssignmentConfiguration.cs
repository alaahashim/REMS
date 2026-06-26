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

            builder.Property(x => x.RoleType)
                   .IsRequired();

            builder.Property(x => x.ShareType)
                   .IsRequired();

            builder.Property(x => x.SharePercentage)
                   .HasDefaultValue(100);

            // Owner -> Assignments
            builder.HasOne(x => x.Owner)
                   .WithMany(x => x.Assignments)
                   .HasForeignKey(x => x.OwnerId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Unit -> Assignments  ← دي أهم نقطة
            builder.HasOne(x => x.Unit)
                   .WithMany(u => u.Assignments)
                   .HasForeignKey(x => x.UnitId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}