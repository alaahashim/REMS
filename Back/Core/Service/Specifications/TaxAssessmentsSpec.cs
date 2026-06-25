using Core.DomainLayer.Entities;
using Core.Specifications;

namespace Core.Service.Specifications
{
    public class UnitsForReviewerTaxTasksSpec : BaseSpecifications<Unit, int>
    {
        public UnitsForReviewerTaxTasksSpec()
        {
            AddInclude(u => u.Property);
            AddInclude("Property.Governorate");
            AddInclude("Property.Neighborhood");
            AddInclude(u => u.Assignments);
            AddInclude("Assignments.Owner");
        }
    }

    public class UnitForTaxCalculationSpec : BaseSpecifications<Unit, int>
    {
        public UnitForTaxCalculationSpec(int unitId)
            : base(u => u.Id == unitId)
        {
            AddInclude(u => u.Property);
            AddInclude("Property.Governorate");
            AddInclude("Property.Neighborhood");
            AddInclude(u => u.Assignments);
            AddInclude("Assignments.Owner");
        }
    }

    public class TaxAssessmentByUnitYearSpec : BaseSpecifications<TaxAssessment, int>
    {
        public TaxAssessmentByUnitYearSpec(int unitId, int taxYear)
            : base(x => x.UnitId == unitId && x.TaxYear == taxYear)
        {
        }
    }

    public class TaxAssessmentByUnitSpec : BaseSpecifications<TaxAssessment, int>
    {
        public TaxAssessmentByUnitSpec(int unitId)
            : base(x => x.UnitId == unitId)
        {
        }
    }

    public class ActiveTaxRulesSpec : BaseSpecifications<TaxRule, int>
    {
        public ActiveTaxRulesSpec(DateTime referenceDate)
            : base(r =>
                r.IsActive &&
                r.EffectiveFrom <= referenceDate &&
                (r.EffectiveTo == null || r.EffectiveTo >= referenceDate))
        {
        }
    }
}