using Core.DomainLayer.Entities.AdminModule;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Persistence.Configurations
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.EmployeeCode)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(e => e.FullName)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(e => e.NationalId)
                .IsRequired()
                .HasMaxLength(14)
                .HasColumnName("NationalId");

            builder.HasIndex(e => e.NationalId)
                .IsUnique();

            builder.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(256)
                .HasDefaultValue("");

            builder.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(11)
                .HasDefaultValue("");

            builder.Property(e => e.PicturePath)
                .HasMaxLength(500);

            builder.HasMany<PasswordResetOtp>()
                .WithOne(o => o.Employee)
                .HasForeignKey(o => o.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
