using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class ExemptionAttachment : BaseEntity<int>
    {
        public int ExemptionId { get; set; }
        public Exemption Exemption { get; set; } = null!;

        public string DocumentType { get; set; } = null!;
        public string FilePath { get; set; } = null!;
    }
}