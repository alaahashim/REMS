using Core.DomainLayer.Entities;

namespace Shared.DTOS
{
    // =========================================================
    // 1) Common / Shared DTOs
    // =========================================================

    /// <summary>
    /// بيانات شخص مرتبط بالوحدة (مالك / مستأجر)
    /// لاحظ أن الشخص فعلياً مخزن في جدول Owner
    /// ونوع العلاقة يُحدد من RoleAssignment.RoleType
    /// </summary>
    public class PersonRoleDto
    {
        public int OwnerId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string RoleType { get; set; } = string.Empty; // مالك / مستأجر
        public double SharePercentage { get; set; }
        public string? Phone { get; set; }
        public string? NationalId { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// Generic paged result لأي قائمة فيها pagination
    /// </summary>
    public class PagedResultDto<T>
    {
        public IReadOnlyList<T> Items { get; set; } = new List<T>();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }


    // =========================================================
    // 2) Reviewer Tasks - Query DTO
    // =========================================================

    /// <summary>
    /// بارامترات شاشة مهام المراجع:
    /// - فلترة بالحالة
    /// - بحث باسم المالك
    /// - Pagination
    /// </summary>
    public class ReviewerTaxTasksQueryDto
    {
        /// <summary>
        /// PendingCalculation / Approved
        /// </summary>
        public string? Status { get; set; }

        /// <summary>
        /// بحث باسم المالك الأساسي أو أي مالك مرتبط بالوحدة
        /// </summary>
        public string? OwnerName { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }


    // =========================================================
    // 3) Reviewer Tasks - List DTO
    // =========================================================

    /// <summary>
    /// العنصر الظاهر في قائمة مهام المراجع
    /// </summary>
    public class ReviewerTaxTaskListItemDto
    {
        public int UnitId { get; set; }
        public string UnitNumber { get; set; } = string.Empty;
        public string? UnitType { get; set; }
        public int Floor { get; set; }
        public double Area { get; set; }
        public string Usage { get; set; } = "-";

        /// <summary>
        /// اسم المالك الأساسي (أعلى نسبة ملكية مثلاً)
        /// </summary>
        public string OwnerName { get; set; } = "-";

        public string PropertyAddress { get; set; } = "-";

        /// <summary>
        /// PendingCalculation / Approved
        /// </summary>
        public TaxStatus TaxStatus { get; set; }
    }


    // =========================================================
    // 4) Reviewer Task Details DTO
    // =========================================================

    /// <summary>
    /// تفاصيل الوحدة عند فتح مهمة مراجع واحدة
    /// </summary>
    public class ReviewerTaxTaskDetailsDto
    {
        public int UnitId { get; set; }
        public string UnitNumber { get; set; } = string.Empty;
        public string? UnitType { get; set; }
        public int Floor { get; set; }
        public double Area { get; set; }
        public string Usage { get; set; } = "-";
        public string PropertyAddress { get; set; } = "-";

        /// <summary>
        /// PendingCalculation / Approved
        /// </summary>
        public TaxStatus TaxStatus { get; set; }

        /// <summary>
        /// كل الملاك المرتبطين بالوحدة
        /// </summary>
        public List<PersonRoleDto> Owners { get; set; } = new();

        /// <summary>
        /// كل المستأجرين المرتبطين بالوحدة
        /// </summary>
        public List<PersonRoleDto> Tenants { get; set; } = new();
    }


    // =========================================================
    // 5) Preview / Calculation Request DTO
    // =========================================================

    /// <summary>
    /// طلب معاينة حساب الضريبة بدون حفظ
    /// </summary>
    public class TaxCalculationRequestDto
    {
        public int UnitId { get; set; }
        public int TaxYear { get; set; }

        /// <summary>
        /// لو المراجع يريد إدخال قيمة إيجارية سنوية يدوياً
        /// بدلاً من التقدير التلقائي
        /// </summary>
        public decimal? AnnualRentOverride { get; set; }

        /// <summary>
        /// من سيتحمل الضريبة؟ مالك / مستأجر
        /// </summary>
        public PayerType PayerType { get; set; } = PayerType.Owner;

        /// <summary>
        /// سداد كامل أو تقسيط
        /// </summary>
        public PaymentPlan PaymentPlan { get; set; } = PaymentPlan.Full;

        /// <summary>
        /// هل تُضاف رسوم الطعن؟
        /// </summary>
        public bool IncludeAppealFee { get; set; } = false;
    }


    // =========================================================
    // 6) Approve Request DTO
    // =========================================================

    /// <summary>
    /// نفس مدخلات المعاينة تقريباً لكن الهدف هنا حفظ واعتماد التقييم
    /// </summary>
    public class ApproveTaxAssessmentDto
    {
        public int UnitId { get; set; }
        public int TaxYear { get; set; }

        public decimal? AnnualRentOverride { get; set; }

        public PayerType PayerType { get; set; } = PayerType.Owner;
        public PaymentPlan PaymentPlan { get; set; } = PaymentPlan.Full;

        public bool IncludeAppealFee { get; set; } = false;
    }


    // =========================================================
    // 7) Preview Result DTO
    // =========================================================

    /// <summary>
    /// نتيجة المعاينة والحساب قبل الحفظ
    /// هذا الـ DTO هو الذي يعود من PreviewCalculationAsync
    /// </summary>
    public class TaxCalculationResultDto
    {
        public int UnitId { get; set; }

        /// <summary>
        /// المالك الأساسي المستخدم في الحساب (إن وجد)
        /// </summary>
        public int? OwnerId { get; set; }
        public string OwnerName { get; set; } = "-";

        public int TaxYear { get; set; }
        public string Usage { get; set; } = string.Empty;

        /// <summary>
        /// القيمة الإيجارية السنوية (سواء تلقائية أو override)
        /// </summary>
        public decimal AnnualRent { get; set; }

        /// <summary>
        /// تُرسل للفرونت كنسبة مئوية (30 وليس 0.30)
        /// </summary>
        public decimal DiscountRate { get; set; }

        public decimal DiscountAmount { get; set; }

        /// <summary>
        /// صافي القيمة الإيجارية السنوية بعد خصم الصيانة
        /// </summary>
        public decimal NetAnnualRentalValue { get; set; }

        /// <summary>
        /// تُرسل للفرونت كنسبة مئوية (10 وليس 0.10)
        /// </summary>
        public decimal TaxRate { get; set; }

        public decimal AnnualTax { get; set; }

        public bool IsExempted { get; set; }
        public decimal ExemptionAmount { get; set; }
        public string? ExemptionReason { get; set; }

        public decimal AppealFee { get; set; }
        public decimal TotalDue { get; set; }

        public PayerType PayerType { get; set; } = PayerType.Owner;
        public PaymentPlan PaymentPlan { get; set; } = PaymentPlan.Full;

        public int InstallmentCount { get; set; }
        public decimal InstallmentAmount { get; set; }

        /// <summary>
        /// وصف مختصر لموقع/عنوان العقار لإظهاره في الواجهة
        /// </summary>
        public string ZoneDescription { get; set; } = "-";

        /// <summary>
        /// هل AnnualRent جاء من إدخال يدوي أم من التقدير التلقائي
        /// </summary>
        public bool IsFromManualAnnualRent { get; set; }
    }


    // =========================================================
    // 8) Saved Assessment DTO
    // =========================================================

    /// <summary>
    /// التقييم المحفوظ فعلياً في قاعدة البيانات
    /// يعود من GetAssessmentByUnitYearAsync
    /// </summary>
    public class TaxAssessmentDto
    {
        public int Id { get; set; }

        public int UnitId { get; set; }
        public int? OwnerId { get; set; }
        public string OwnerName { get; set; } = "-";

        public int TaxYear { get; set; }
        public string Usage { get; set; } = string.Empty;

        public decimal AnnualRent { get; set; }

        /// <summary>
        /// يفضل إرجاعها للفرونت كنسبة مئوية
        /// </summary>
        public decimal MaintenanceDiscountRate { get; set; }

        public decimal MaintenanceDiscountAmount { get; set; }
        public decimal NetAnnualRentalValue { get; set; }

        /// <summary>
        /// يفضل إرجاعها للفرونت كنسبة مئوية
        /// </summary>
        public decimal TaxRate { get; set; }

        public decimal AnnualTax { get; set; }

        public bool IsExempted { get; set; }
        public decimal ExemptionAmount { get; set; }
        public string? ExemptionReason { get; set; }

        public PayerType PayerType { get; set; } = PayerType.Owner;
        public PaymentPlan PaymentPlan { get; set; } = PaymentPlan.Full;

        public decimal AppealFee { get; set; }
        public decimal TotalDue { get; set; }

        public DateTime CalculationDate { get; set; }
        public TaxStatus Status { get; set; } = TaxStatus.Approved;
        public string? Notes { get; set; }

        /// <summary>
        /// اختياري لكن مفيد جداً للفرونت عند فتح تقييم محفوظ
        /// </summary>
        public string PropertyAddress { get; set; } = "-";
    }


    // =========================================================
    // 9) Exemption Check DTO
    // =========================================================

    /// <summary>
    /// نتيجة فحص الإعفاء الضريبي
    /// تستخدم داخلياً أو عند الحاجة
    /// </summary>
    public class TaxExemptionCheckResultDto
    {
        public bool IsExempted { get; set; }
        public decimal ExemptionAmount { get; set; }
        public string? ExemptionReason { get; set; }
    }


    // =========================================================
    // 10) Approve Response DTO (اختياري لكنه أنظف من anonymous object)
    // =========================================================

    /// <summary>
    /// نتيجة عملية اعتماد التقييم
    /// بدلاً من return new { success = true, assessmentId = id }
    /// </summary>
    public class ApproveTaxAssessmentResultDto
    {
        public bool Success { get; set; }
        public int AssessmentId { get; set; }
        public string Message { get; set; } = "تم اعتماد التقييم الضريبي بنجاح";
    }
}