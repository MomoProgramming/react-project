using Luminium.Api.Data;
using Luminium.Api.Storage;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;

var builder = WebApplication.CreateBuilder(args);

// user-secrets are loaded automatically only in Development; load them for Testing too.
if (builder.Environment.IsEnvironment("Testing"))
    builder.Configuration.AddUserSecrets<Program>(optional: true);

// ---------- Database ----------
// ConnectionStrings:DefaultConnection holds host/port/database/user (no password).
// The password comes from Db:Password (user-secrets locally, App Service setting / Key Vault on Azure).
// On Azure you may instead put the full connection string in ConnectionStrings__DefaultConnection.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured. See api/README.md.");
var csb = new MySqlConnectionStringBuilder(connectionString);
var dbPassword = builder.Configuration["Db:Password"];
if (!string.IsNullOrEmpty(dbPassword)) csb.Password = dbPassword;

builder.Services.AddDbContext<AppDbContext>(options => options.UseMySQL(csb.ConnectionString));

// ---------- File storage (swap for an Azure Blob implementation later) ----------
var storageOptions = builder.Configuration.GetSection("Uploads").Get<LocalFileStorageOptions>() ?? new();
builder.Services.AddSingleton(storageOptions);
builder.Services.AddSingleton<IFileStorage, LocalFileStorage>();

// ---------- CORS ----------
// Development: http://localhost:5173 (Vite). Production: set Cors:AllowedOrigins
// (e.g. App Service setting Cors__AllowedOrigins__0=https://your-site.example).
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(allowedOrigins)
    .WithMethods("GET", "POST")
    .AllowAnyHeader()));

builder.Services.AddControllers();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler(); // unhandled errors -> RFC 7807 problem+json 500, no stack traces
app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();

app.Run();
