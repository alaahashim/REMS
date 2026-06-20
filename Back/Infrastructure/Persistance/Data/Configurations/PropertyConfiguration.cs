using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class PropertyConfiguration
        : IEntityTypeConfiguration<Property>
    {
        public void Configure(EntityTypeBuilder<Property> builder)
        {
            builder.Property(p => p.CurrentPropertyNo)
                .IsRequired()
                .HasMaxLength(50);

    

            builder.HasMany(p => p.Units)
                .WithOne(u => u.Property)
                .HasForeignKey(u => u.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

        public class UnitConfiguration
        : IEntityTypeConfiguration<Unit>
    {
        public void Configure(EntityTypeBuilder<Unit> builder)
        {
            builder.Property(u => u.UnitNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.Status)
                .HasMaxLength(50);
        }
    }

}