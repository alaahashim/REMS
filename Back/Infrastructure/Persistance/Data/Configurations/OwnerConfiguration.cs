using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class OwnerConfiguration
        : IEntityTypeConfiguration<Owner>
    {
        public void Configure(
            EntityTypeBuilder<Owner> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.NationalId)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.FullName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Phone)
                .HasMaxLength(20);

            builder.Property(x => x.Address)
                .HasMaxLength(500);

            builder.Property(x => x.OwnerType)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(x => x.NationalId)
                .IsUnique();

            builder.HasMany(x => x.Assignments)
                .WithOne(x => x.Owner)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}