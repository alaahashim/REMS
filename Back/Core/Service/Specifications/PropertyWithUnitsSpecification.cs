
using Core.DomainLayer.Entities;
using Core.Specifications;
namespace  Core.Specifications
{
public class PropertyWithUnitsSpecification
    : BaseSpecifications<Property, int>
{
    public PropertyWithUnitsSpecification()
    {
        AddInclude(p => p.Units);
    }
}}