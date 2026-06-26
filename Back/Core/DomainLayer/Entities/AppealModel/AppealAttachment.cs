using Core.DomainLayer.Entities.Common;

namespace Core.DomainLayer.Entities
{
    public class AppealAttachment : BaseEntity<int>
    {
        public int AppealId { get; set; }
        public Appeal Appeal { get; set; } = null!;

        public string DocumentType { get; set; } = null!;
        public string FileName { get; set; } = null!;
        public string FilePath { get; set; } = null!;
    }
}