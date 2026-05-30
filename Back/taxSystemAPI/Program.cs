using Persistence.Data;
using Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Core.ServiceAbstraction;
using Core.DomainLayer.Contracts;
using Core.Service.Implementations;
using AutoMapper;
using Service.MappingProfiles;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();


// =========================
// AutoMapper
// =========================

builder.Services.AddAutoMapper(typeof(MappingProfile));


// =========================
// DB Context
// =========================

builder.Services.AddDbContext<StoreDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration
        .GetConnectionString("DefaultConnection"));
});


// =========================
// CORS
// =========================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowAnyOrigin();
        });
});


// =========================
// Dependency Injection
// =========================

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IServiceManager, ServiceManager>();
builder.Services.AddScoped(
    typeof(IGenericRepository<,>),
    typeof(GenericRepository<,>)
);

builder.Services.AddScoped<
    ILocationService,
    LocationService>();


var app = builder.Build();


// =========================
// Middleware
// =========================

app.UseSwagger();

app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();