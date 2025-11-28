using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<OneTimeLoginToken> OneTimeLoginTokens { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Alumni> Alumnis { get; set; }
        public DbSet<Missionary> Missionaries { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<MediaItem> MediaItems { get; set; }
        public DbSet<Testimony> Testimonies { get; set; }
        public DbSet<HomileticsEntry> HomileticsEntries { get; set; }
        public DbSet<Suggestion> Suggestions { get; set; }
        public DbSet<PrayerRequest> PrayerRequests { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Donation> Donations { get; set; }
        public DbSet<DonationCampaign> DonationCampaigns { get; set; }
        public DbSet<Outreach> Outreaches { get; set; }
        public DbSet<OutreachReport> OutreachReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User table configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Role);
                entity.Property(e => e.PrivacySettings).HasColumnType("TEXT");
            });

            // OneTimeLoginToken configuration
            modelBuilder.Entity<OneTimeLoginToken>(entity =>
            {
                entity.ToTable("OneTimeLoginTokens");
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasIndex(e => new { e.Used, e.ExpiresAt });
            });

            // Student configuration
            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students");
                entity.HasOne(s => s.User)
                    .WithOne(u => u.Student)
                    .HasForeignKey<Student>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Alumni configuration
            modelBuilder.Entity<Alumni>(entity =>
            {
                entity.ToTable("Alumni");
                entity.HasOne(a => a.User)
                    .WithOne(u => u.Alumni)
                    .HasForeignKey<Alumni>(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Missionary configuration
            modelBuilder.Entity<Missionary>(entity =>
            {
                entity.ToTable("Missionaries");
                entity.HasOne(m => m.User)
                    .WithOne(u => u.Missionary)
                    .HasForeignKey<Missionary>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Post configuration
            modelBuilder.Entity<Post>(entity =>
            {
                entity.ToTable("Posts");
                entity.HasIndex(e => e.PostType);
                entity.HasIndex(e => e.Pinned);
                entity.HasIndex(e => e.CreatedAt);
            });

            // MediaItem configuration
            modelBuilder.Entity<MediaItem>(entity =>
            {
                entity.ToTable("MediaItems");
                entity.HasIndex(e => e.MediaType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.UploadedAt);
            });

            // Testimony configuration
            modelBuilder.Entity<Testimony>(entity =>
            {
                entity.ToTable("Testimonies");
                entity.HasIndex(e => e.Featured);
                entity.HasIndex(e => e.CreatedAt);
            });

            // HomileticsEntry configuration
            modelBuilder.Entity<HomileticsEntry>(entity =>
            {
                entity.ToTable("HomileticsEntries");
                entity.HasIndex(e => e.UploadedAt);
                entity.HasIndex(e => e.ExpiresAt);
            });

            // Suggestion configuration
            modelBuilder.Entity<Suggestion>(entity =>
            {
                entity.ToTable("Suggestions");
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // PrayerRequest configuration
            modelBuilder.Entity<PrayerRequest>(entity =>
            {
                entity.ToTable("PrayerRequests");
                entity.HasIndex(e => e.Urgency);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Comment configuration
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("Comments");
                entity.HasIndex(e => new { e.ParentType, e.ParentId });
                entity.HasIndex(e => e.CreatedAt);
            });

            // Like configuration
            modelBuilder.Entity<Like>(entity =>
            {
                entity.ToTable("Likes");
                entity.HasIndex(e => new { e.UserId, e.ParentType, e.ParentId }).IsUnique();
                entity.HasIndex(e => new { e.ParentType, e.ParentId });
            });

            // AuditLog configuration
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");
                entity.HasIndex(e => e.ActionType);
                entity.HasIndex(e => e.TargetTable);
                entity.HasIndex(e => e.Timestamp);
            });

            // Donation configuration
            modelBuilder.Entity<Donation>(entity =>
            {
                entity.ToTable("Donations");
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.DonationType);
                entity.HasIndex(e => e.CreatedAt);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            });

            // DonationCampaign configuration
            modelBuilder.Entity<DonationCampaign>(entity =>
            {
                entity.ToTable("DonationCampaigns");
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.Property(e => e.GoalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CurrentAmount).HasColumnType("decimal(18,2)");
            });

            // Outreach configuration
            modelBuilder.Entity<Outreach>(entity =>
            {
                entity.ToTable("Outreaches");
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // OutreachReport configuration
            modelBuilder.Entity<OutreachReport>(entity =>
            {
                entity.ToTable("OutreachReports");
                entity.HasIndex(e => e.OutreachId);
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}