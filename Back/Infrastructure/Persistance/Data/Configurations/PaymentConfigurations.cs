using Core.DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class PaymentConfigurations
        : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.PaidAmount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(p => p.PaymentDate)
                   .IsRequired();

            builder.Property(p => p.Notes)
                   .HasMaxLength(500);

            builder.HasOne(p => p.Installment)
                   .WithMany(i => i.Payments)
                   .HasForeignKey(p => p.InstallmentId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }

    public class InstallmentConfigurations
        : IEntityTypeConfiguration<Installment>
    {
        public void Configure(EntityTypeBuilder<Installment> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(i => i.Amount)
                   .HasColumnType("decimal(18,2)")
                   .IsRequired();

            builder.Property(i => i.DueDate)
                   .IsRequired();

            builder.Property(i => i.InstallmentNumber)
                   .IsRequired();

            builder.Property(i => i.Status)
                   .HasConversion<string>()
                   .IsRequired();

            builder.HasOne(i => i.TaxAssessment)
                   .WithMany(t => t.Installments)
                   .HasForeignKey(i => i.TaxAssessmentId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}