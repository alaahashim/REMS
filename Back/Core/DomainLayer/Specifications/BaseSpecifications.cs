using Core.DomainLayer.Entities.Common;
using System.Linq.Expressions;

namespace Core.Specifications
{
    public abstract class BaseSpecifications<TEntity, Tkey>
        : ISpecifications<TEntity, Tkey>
        where TEntity : BaseEntity<Tkey>
    {
        protected BaseSpecifications()
        {
        }

        protected BaseSpecifications(
            Expression<Func<TEntity, bool>> criteriaExpression)
        {
            Criteria = criteriaExpression;
        }

        public Expression<Func<TEntity, bool>>?
            Criteria { get; private set; }

        public List<Expression<Func<TEntity, object>>>
            IncludeExpressions { get; } = [];

        public Expression<Func<TEntity, object>>?
            OrderBy { get; private set; }

        public Expression<Func<TEntity, object>>?
            OrderByDescending { get; private set; }

        public int Take { get; private set; }

        public int Skip { get; private set; }

        public bool IsPaginated { get; private set; }

        protected void AddInclude(
            Expression<Func<TEntity, object>> includeExpression)
        {
            IncludeExpressions.Add(includeExpression);
        }

        protected void AddOrderBy(
            Expression<Func<TEntity, object>> orderByExpression)
        {
            OrderBy = orderByExpression;
        }

        protected void AddOrderByDescending(
            Expression<Func<TEntity, object>>
            orderByDescendingExpression)
        {
            OrderByDescending = orderByDescendingExpression;
        }

        protected void ApplyPagination(
            int pageSize,
            int pageIndex)
        {
            IsPaginated = true;

            Take = pageSize;

            Skip = (pageIndex - 1) * pageSize;
        }

/*public List<Func<IQueryable<TEntity>, IQueryable<TEntity>>> IncludeQueries { get; } = [];
protected void AddInclude(Func<IQueryable<TEntity>, IQueryable<TEntity>> includeQuery)
{
    IncludeQueries.Add(includeQuery);
}*/
    }
}