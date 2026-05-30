using Core.DomainLayer.Entities.Common;
using Core.DomainLayer.Contracts;
using Core.Specifications;
using Infrastructure.Persistence.Specifications;
using Microsoft.EntityFrameworkCore;
using Persistence.Data;
namespace Infrastructure.Persistence.Repositories
{
    public class GenericRepository<TEntity, Tkey>
        : IGenericRepository<TEntity, Tkey>
        where TEntity : BaseEntity<Tkey>
    {
        private readonly StoreDbContext _dbContext;

        public GenericRepository(StoreDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _dbContext
                .Set<TEntity>()
                .ToListAsync();
        }

        public async Task<TEntity?> GetByIdAsync(Tkey id)
        {
            return await _dbContext
                .Set<TEntity>()
                .FindAsync(id);
        }

        public async Task<IEnumerable<TEntity>>
            GetAllAsync(
            ISpecifications<TEntity, Tkey> specifications)
        {
            return await SpecificationEvaluator
                .CreateQuery(
                    _dbContext.Set<TEntity>(),
                    specifications)
                .ToListAsync();
        }

        public async Task<TEntity?>
            GetByIdAsync(
            ISpecifications<TEntity, Tkey> specifications)
        {
            return await SpecificationEvaluator
                .CreateQuery(
                    _dbContext.Set<TEntity>(),
                    specifications)
                .FirstOrDefaultAsync();
        }

        public async Task<int>
            CountAsync(
            ISpecifications<TEntity, Tkey> specifications)
        {
            return await SpecificationEvaluator
                .CreateQuery(
                    _dbContext.Set<TEntity>(),
                    specifications)
                .CountAsync();
        }

        public async Task AddAsync(TEntity entity)
        {
            await _dbContext
                .Set<TEntity>()
                .AddAsync(entity);
        }

        public void Update(TEntity entity)
        {
            _dbContext
                .Set<TEntity>()
                .Update(entity);
        }

        public void Remove(TEntity entity)
        {
            _dbContext
                .Set<TEntity>()
                .Remove(entity);
        }
    }
}