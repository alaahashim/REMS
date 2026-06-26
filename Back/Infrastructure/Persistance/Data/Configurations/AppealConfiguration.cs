using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Data.Configurations
{
    public class AppealConfigurations : IEntityTypeConfiguration<Appeal>
    {
        public void Configure(EntityTypeBuilder<Appeal> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.AppealReason)
                .HasMaxLength(4000)
                .IsRequired();

            builder.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            // كل تقييم ضريبي له طعن واحد فقط
            builder.HasIndex(x => x.TaxAssessmentId).IsUnique();

            builder.HasOne(x => x.TaxAssessment)
                .WithOne(t => t.Appeal)
                .HasForeignKey<Appeal>(x => x.TaxAssessmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }

      public class AppealAttachmentConfigurations : IEntityTypeConfiguration<AppealAttachment>
    {
        public void Configure(EntityTypeBuilder<AppealAttachment> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.DocumentType)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(x => x.FilePath)
                .HasMaxLength(1000)
                .IsRequired();

            builder.HasOne(x => x.Appeal)
                .WithMany()
                .HasForeignKey(x => x.AppealId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}