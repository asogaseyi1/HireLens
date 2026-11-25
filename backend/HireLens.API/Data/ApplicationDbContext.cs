using HireLens.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HireLens.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<JobApplication> JobApplications => Set<JobApplication>();
        public DbSet<GeneratedDocument> GeneratedDocuments => Set<GeneratedDocument>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<JobApplication>(e =>
            {
                e.Property(a => a.Status).HasConversion<string>().HasMaxLength(32);
                e.HasIndex(a => new { a.AppUserId, a.Status });
                e.HasOne(a => a.AppUser)
                    .WithMany(u => u.JobApplications)
                    .HasForeignKey(a => a.AppUserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            builder.Entity<GeneratedDocument>(e =>
            {
                e.Property(d => d.Type).HasConversion<string>().HasMaxLength(32);
                e.HasOne(d => d.JobApplication)
                    .WithMany(a => a.Documents)
                    .HasForeignKey(d => d.JobApplicationId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
