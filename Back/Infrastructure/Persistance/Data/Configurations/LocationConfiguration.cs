using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Data.Configurations
{
    public class GovernorateConfiguration 
    : IEntityTypeConfiguration<Governorate>
{
    public void Configure(EntityTypeBuilder<Governorate> builder)
    {
        builder.Property(g => g.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasMany(g => g.Centers)
            .WithOne(c => c.Governorate)
            .HasForeignKey(c => c.GovernorateId);
    }
}
public class CenterConfiguration 
    : IEntityTypeConfiguration<Center>
{
    public void Configure(EntityTypeBuilder<Center> builder)
    {
        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasMany(c => c.Streets)
            .WithOne(s => s.Center)
            .HasForeignKey(s => s.CenterId);
    }
}

public class StreetConfiguration 
    : IEntityTypeConfiguration<Street>
{
    public void Configure(EntityTypeBuilder<Street> builder)
    {
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(150);
    }
}
}