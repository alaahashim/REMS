using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Data.Configurations
{
      public class TaxRuleConfigurations : IEntityTypeConfiguration<TaxRule>
    {
        public void Configure(EntityTypeBuilder<TaxRule> builder)
        {
            builder.ToTable("TaxRules");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.RuleCode)
                .IsRequired()
                .HasMaxLength(100);

           

            builder.Property(x => x.RuleValue)
                .HasColumnType("decimal(18,2)");

          

            builder.HasIndex(x => x.RuleCode);
        }
    }

    public class TaxAssessmentConfigurations : IEntityTypeConfiguration<TaxAssessment>
    {
        public void Configure(EntityTypeBuilder<TaxAssessment> builder)
        {
            builder.ToTable("TaxAssessments");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.AnnualRent)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.MaintenanceDiscountRate)
                .HasColumnType("decimal(8,4)");

            builder.Property(x => x.MaintenanceDiscountAmount)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.NetAnnualRentalValue)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.TaxRate)
                .HasColumnType("decimal(8,4)");

            builder.Property(x => x.AnnualTax)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.ExemptionAmount)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.AppealFee)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.TotalDue)
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Notes)
                .HasMaxLength(1000);

            builder.HasOne(x => x.Unit)
                .WithMany()
                .HasForeignKey(x => x.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Owner)
                .WithMany()
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // لو تريدين منع أكثر من سجل لنفس الوحدة/السنة
            builder.HasIndex(x => new { x.UnitId, x.TaxYear })
                .IsUnique();

                  builder.HasIndex(x => new { x.UnitId, x.TaxYear }).IsUnique();

            // 1:1 مع Appeal
            builder.HasOne(x => x.Appeal)
                .WithOne(a => a.TaxAssessment)
                .HasForeignKey<Appeal>(a => a.TaxAssessmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }}
}