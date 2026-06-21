using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistance.Configurations
{
    public class ExemptionConfiguration : IEntityTypeConfiguration<Exemption>
    {
        public void Configure(EntityTypeBuilder<Exemption> builder)
        {
            builder.ToTable("Exemptions");

            builder.HasKey(e => e.Id);

            // Owner relationship
            builder.HasOne(e => e.Owner)
                .WithMany()
                .HasForeignKey(e => e.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unit relationship
            builder.HasOne(e => e.Unit)
                .WithMany()
                .HasForeignKey(e => e.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            // Properties
          

            // Relationship with attachments
            builder.HasMany(e => e.Attachments)
                .WithOne(a => a.Exemption)
                .HasForeignKey(a => a.ExemptionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

     public class ExemptionAttachmentConfiguration : IEntityTypeConfiguration<ExemptionAttachment>
    {
        public void Configure(EntityTypeBuilder<ExemptionAttachment> builder)
        {
            builder.ToTable("ExemptionAttachments");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.DocumentType)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.FilePath)
                .IsRequired()
                .HasMaxLength(500);
        }
    }
}