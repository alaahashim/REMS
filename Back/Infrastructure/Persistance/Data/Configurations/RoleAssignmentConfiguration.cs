using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class RoleAssignmentConfiguration
        : IEntityTypeConfiguration<RoleAssignment>
    {
        public void Configure(
            EntityTypeBuilder<RoleAssignment> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.RoleType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.ShareType)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.SharePercentage)
                .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.Owner)
                .WithMany(x => x.Assignments)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Property)
                .WithMany(x => x.Assignments)
                .HasForeignKey(x => x.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Unit)
                .WithMany(x => x.Assignments)
                .HasForeignKey(x => x.UnitId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}