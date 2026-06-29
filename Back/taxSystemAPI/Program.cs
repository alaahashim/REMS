using Persistence.Data;
using Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Core.ServiceAbstraction;
using Core.DomainLayer.Contracts;
using Core.Service.Implementations;
using AutoMapper;
using Core.Service.MappingProfiles;
using Presentation.Middlewares;
using System.Text.Json.Serialization;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Core.DomainLayer.Entities.AdminModule;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var dataProtectionKeysPath = Path.Combine(builder.Environment.ContentRootPath, "DataProtectionKeys");
Directory.CreateDirectory(dataProtectionKeysPath);
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionKeysPath));

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// =========================
// AutoMapper
// =========================

builder.Services.AddAutoMapper(typeof(MappingProfile));

var mapperConfig = builder.Services.BuildServiceProvider()
    .GetRequiredService<IMapper>();

// =========================
// DB Context
// =========================

builder.Services.AddDbContext<StoreDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration
        .GetConnectionString("DefaultConnection"));
});

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.Converters
           .Add(new JsonStringEnumConverter());
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
// JWT Authentication
// =========================
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var jwtSecretKey =
    builder.Configuration["Jwt:Key"] ??
    builder.Configuration["Jwt:SecretKey"];

if (string.IsNullOrWhiteSpace(jwtIssuer) ||
    string.IsNullOrWhiteSpace(jwtAudience) ||
    string.IsNullOrWhiteSpace(jwtSecretKey))
{
    throw new InvalidOperationException("JWT settings are missing. Please configure Jwt:Issuer, Jwt:Audience and Jwt:Key.");
}

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var employeeIdClaim =
                context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier) ??
                context.Principal?.FindFirstValue("employeeId") ??
                context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub);

            var issuedAtClaim = context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Iat);

            if (!int.TryParse(employeeIdClaim, out var employeeId) ||
                !long.TryParse(issuedAtClaim, out var issuedAtUnixSeconds))
            {
                context.Fail("Invalid token.");
                return;
            }

            var dbContext = context.HttpContext.RequestServices.GetRequiredService<StoreDbContext>();
            var employee = await dbContext.Set<Employee>()
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            if (employee == null || !employee.IsActive)
            {
                context.Fail("Invalid token.");
                return;
            }

            if (employee.LastPasswordChangedAt.HasValue)
            {
                var issuedAt = DateTimeOffset.FromUnixTimeSeconds(issuedAtUnixSeconds).UtcDateTime;
                if (issuedAt <= employee.LastPasswordChangedAt.Value)
                {
                    context.Fail("Password has been reset. Please sign in again.");
                }
            }
        }
    };
});


// =========================
// Dependency Injection
// =========================
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ILocationService, LocationService>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IServiceManager, ServiceManager>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IIdentityService, IdentityService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped(
    typeof(IGenericRepository<,>),
    typeof(GenericRepository<,>)
);





var app = builder.Build();


// =========================
// Middleware
app.UseMiddleware<ExceptionMiddleware>();
// =========================

app.UseSwagger();

app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowReact");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
