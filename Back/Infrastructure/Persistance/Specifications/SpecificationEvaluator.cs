using Core.DomainLayer.Entities.Common;
using Core.Specifications;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Specifications
{
    public static class SpecificationEvaluator
    {
        public static IQueryable<TEntity>
            CreateQuery<TEntity, Tkey>(
            IQueryable<TEntity> inputQuery,
            ISpecifications<TEntity, Tkey> specifications)
            where TEntity : BaseEntity<Tkey>
        {
            var query = inputQuery;

            if (specifications.Criteria is not null)
            {
                query = query.Where(specifications.Criteria);
            }

            if (specifications.OrderBy is not null)
            {
                query = query.OrderBy(specifications.OrderBy);
            }

            if (specifications.OrderByDescending is not null)
            {
                query = query
                    .OrderByDescending(
                        specifications.OrderByDescending);
            }

            if (specifications.IncludeExpressions is not null
                && specifications.IncludeExpressions.Count > 0)
            {
                query = specifications
                    .IncludeExpressions
                    .Aggregate(
                        query,
                        (currentQuery, includeExpression)
                        => currentQuery.Include(includeExpression));
            }

            if (specifications.IsPaginated)
            {
                query = query
                    .Skip(specifications.Skip)
                    .Take(specifications.Take);
            }
            return query;
        }
    }
}