using System;
using Core.DomainLayer.Entities;
using Core.Specifications;

namespace Core.Service.Specifications
{
    // ====================================================================
    // 1) AppealWithDetailsSpec - لجلب الطعون مع كافة تفاصيل الربط والوحدة والموقع الجغرافي
    // (يحتوي على Overload بدون بارامتر لجلب الكل، و Overload بالـ Id لجلب طعن محدد)
    // ====================================================================
    public class AppealWithDetailsSpec : BaseSpecifications<Appeal, int>
    {
        // لجلب جميع الطعون (مثلاً لشاشة الهوم أو الاستعراض العام)
        public AppealWithDetailsSpec()
        {
            AddInclude("TaxAssessment");
            AddInclude("TaxAssessment.Owner");
            AddInclude("TaxAssessment.Unit");
            AddInclude("TaxAssessment.Unit.Property");
            AddInclude("TaxAssessment.Unit.Property.Governorate");
            AddInclude("TaxAssessment.Unit.Property.Neighborhood");
        }

        // لجلب طعن معين بناءً على الـ Id (لشاشة التعديل أو التفاصيل)
        public AppealWithDetailsSpec(int appealId) : base(a => a.Id == appealId)
        {
            AddInclude("TaxAssessment");
            AddInclude("TaxAssessment.Owner");
            AddInclude("TaxAssessment.Unit");
            AddInclude("TaxAssessment.Unit.Property");
            AddInclude("TaxAssessment.Unit.Property.Governorate");
            AddInclude("TaxAssessment.Unit.Property.Neighborhood");
        }
    }

    // ====================================================================
    // 2) AppealByTaxAssessmentSpec - للتحقق من أو جلب الطعن المرتبط بربط ضريبي معين
    // ====================================================================
    public class AppealByTaxAssessmentSpec : BaseSpecifications<Appeal, int>
    {
        public AppealByTaxAssessmentSpec(int taxAssessmentId)
            : base(a => a.TaxAssessmentId == taxAssessmentId)
        {
            AddInclude("TaxAssessment");
            AddInclude("TaxAssessment.Owner");
            AddInclude("TaxAssessment.Unit");
        }
    }

    // ====================================================================
    // 3) TaxAssessmentForAppealLookupSpec - لشاشة البحث والإنشاء (يجلب التقييمات المعتمدة فقط مع تفاصيلها)
    // ====================================================================
    public class TaxAssessmentForAppealLookupSpec : BaseSpecifications<TaxAssessment, int>
    {
        public TaxAssessmentForAppealLookupSpec()
            : base(t => t.Status == TaxStatus.Approved)
        {
            AddInclude("Owner");
            AddInclude("Unit");
            AddInclude("Unit.Property");
            AddInclude("Unit.Property.Governorate");
            AddInclude("Unit.Property.Neighborhood");
            AddInclude("Appeal"); // للتحقق من وجود طعن سابق (HasAppeal)
        }
    }

    // ====================================================================
    // 4) AppealAttachmentByAppealSpec - لجلب المرفقات الخاصة بطعن معين
    // ====================================================================
    public class AppealAttachmentByAppealSpec : BaseSpecifications<AppealAttachment, int>
    {
        public AppealAttachmentByAppealSpec(int appealId)
            : base(a => a.AppealId == appealId)
        {
            // فلترة مباشرة بالـ AppealId من خلال الـ Base Constructor
        }
    }
}