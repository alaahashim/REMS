


using Core.DomainLayer.Entities;
using Core.Specifications;

public class ExemptionHomeSpec : BaseSpecifications<Exemption, int>
    {
        public ExemptionHomeSpec()
        {
            AddInclude(e => e.Owner);
        }
    }