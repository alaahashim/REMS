using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class TaxRule : BaseEntity<int>
    {
        // مثال: TAX_RATE / RESIDENTIAL_DISCOUNT / NON_RESIDENTIAL_DISCOUNT
        public string RuleCode { get; set; } = null!;

        // مثال: 0.10 / 0.30 / 0.32
        public decimal RuleValue { get; set; }

        public string? Description { get; set; }

        // تاريخ بدء سريان القاعدة
        public DateTime EffectiveFrom { get; set; }

        // لو null => مازالت فعالة
        public DateTime? EffectiveTo { get; set; }

        public bool IsActive { get; set; } = true;
    }
}