using Core.DomainLayer.Entities.Common;
using System.Linq.Expressions;

namespace Core.Specifications
{
    public interface ISpecifications<TEntity, Tkey>
        where TEntity : BaseEntity<Tkey>
    {
        Expression<Func<TEntity, bool>>? Criteria { get; }

        List<Expression<Func<TEntity, object>>>
            IncludeExpressions { get; }

        Expression<Func<TEntity, object>>? OrderBy { get; }

        Expression<Func<TEntity, object>>?
            OrderByDescending { get; }

        int Take { get; }

        int Skip { get; }

        bool IsPaginated { get; }
    }
}