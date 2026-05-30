using Core.DomainLayer.Entities.Common;
using Core.DomainLayer.Contracts;
using Core.Specifications;
using Infrastructure.Persistence.Specifications;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;
namespace Infrastructure.Persistence.Repositories
{public class UnitOfWork : IUnitOfWork
    {
        private readonly StoreDbContext _dbContext;

        private readonly Dictionary<string, object>
            _repositories = new();

        public UnitOfWork(StoreDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public IGenericRepository<TEntity, Tkey>
            GetRepository<TEntity, Tkey>()
            where TEntity : BaseEntity<Tkey>
        {
            var typeName = typeof(TEntity).Name;

            if (_repositories.TryGetValue(typeName, out var repo))
            {
                return (IGenericRepository<TEntity, Tkey>)repo;
            }

            var repository =
                new GenericRepository<TEntity, Tkey>(_dbContext);

            _repositories[typeName] = repository;

            return repository;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _dbContext.SaveChangesAsync();
        }
    }}