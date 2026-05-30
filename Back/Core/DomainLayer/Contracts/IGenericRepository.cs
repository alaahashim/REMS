using Core.DomainLayer.Entities.Common;
using Core.Specifications;

namespace Core.DomainLayer.Contracts
{
    public interface IGenericRepository<TEntity, Tkey>
        where TEntity : BaseEntity<Tkey>
    {
        Task<IEnumerable<TEntity>> GetAllAsync();

        Task<TEntity?> GetByIdAsync(Tkey id);

        Task<IEnumerable<TEntity>> GetAllAsync(
            ISpecifications<TEntity, Tkey> specifications);

        Task<TEntity?> GetByIdAsync(
            ISpecifications<TEntity, Tkey> specifications);

        Task<int> CountAsync(
            ISpecifications<TEntity, Tkey> specifications);

        Task AddAsync(TEntity entity);

        void Update(TEntity entity);

        void Remove(TEntity entity);
    }
}