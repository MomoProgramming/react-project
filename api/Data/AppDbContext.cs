using Luminium.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Luminium.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<CommissionRequest> CommissionRequests => Set<CommissionRequest>();
    public DbSet<CommissionImage> CommissionImages => Set<CommissionImage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // MySQL DATETIME has no time zone; we always write UTC, so mark values as UTC when read back.
        var utc = new ValueConverter<DateTime, DateTime>(
            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        modelBuilder.Entity<CommissionRequest>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(CommissionRequest.NameMaxLength).IsRequired();
            e.Property(x => x.Email).HasMaxLength(CommissionRequest.EmailMaxLength).IsRequired();
            e.Property(x => x.Title).HasMaxLength(CommissionRequest.TitleMaxLength).IsRequired();
            e.Property(x => x.Details).HasMaxLength(CommissionRequest.DetailsMaxLength).IsRequired();
            e.Property(x => x.Status)
                .HasMaxLength(CommissionRequest.StatusMaxLength)
                .IsRequired()
                .HasDefaultValue(CommissionRequest.DefaultStatus);
            e.Property(x => x.CreatedAt).HasConversion(utc).IsRequired();
            e.HasIndex(x => x.CreatedAt);

            e.HasMany(x => x.Images)
                .WithOne(i => i.CommissionRequest)
                .HasForeignKey(i => i.CommissionRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CommissionImage>(e =>
        {
            e.Property(x => x.FileName).HasMaxLength(CommissionImage.FileNameMaxLength).IsRequired();
            e.Property(x => x.ContentType).HasMaxLength(CommissionImage.ContentTypeMaxLength).IsRequired();
            e.Property(x => x.StoragePath).HasMaxLength(CommissionImage.StoragePathMaxLength).IsRequired();
        });
    }
}
