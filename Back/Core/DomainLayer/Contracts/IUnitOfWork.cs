using Core.DomainLayer.Entities.Common;
using Core.Specifications;

namespace Core.DomainLayer.Contracts
{public interface IUnitOfWork
    {
        IGenericRepository<TEntity, Tkey>
            GetRepository<TEntity, Tkey>()
            where TEntity : BaseEntity<Tkey>;

        Task<int> SaveChangesAsync();
    }
}