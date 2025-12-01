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

        public DbSet<OneTimeLoginToken> OneTimeLoginTokens { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Alumni> Alumnis { get; set; }
        public DbSet<Missionary> Missionaries { get; set; }
        public DbSet<Mentor> Mentors { get; set; }
        public DbSet<Mentee> Mentees { get; set; }
        public DbSet<MentorshipSession> MentorshipSessions { get; set; }
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

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasIndex(e => e.Email).IsUnique();
                entity.HasIndex(e => e.Role);
                entity.Property(e => e.PrivacySettings).HasColumnType("TEXT");
            });

            modelBuilder.Entity<OneTimeLoginToken>(entity =>
            {
                entity.ToTable("OneTimeLoginTokens");
                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasIndex(e => new { e.Used, e.ExpiresAt });
            });

            modelBuilder.Entity<Student>(entity =>
            {
                entity.ToTable("Students");
                entity.HasOne(s => s.User)
                    .WithOne(u => u.Student)
                    .HasForeignKey<Student>(s => s.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Alumni>(entity =>
            {
                entity.ToTable("Alumni");
                entity.HasOne(a => a.User)
                    .WithOne(u => u.Alumni)
                    .HasForeignKey<Alumni>(a => a.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Missionary>(entity =>
            {
                entity.ToTable("Missionaries");
                entity.HasOne(m => m.User)
                    .WithOne(u => u.Missionary)
                    .HasForeignKey<Missionary>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Mentor>(entity =>
            {
                entity.ToTable("Mentors");
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                
                entity.HasOne(m => m.User)
                    .WithOne(u => u.Mentor)
                    .HasForeignKey<Mentor>(m => m.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.Property(e => e.Availability)
                    .HasColumnType("jsonb");
                    
                entity.Property(e => e.CommunicationChannels)
                    .HasColumnType("jsonb");
            });

            modelBuilder.Entity<Mentee>(entity =>
            {
                entity.ToTable("Mentees");
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.HasIndex(e => e.MentorId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                
                entity.HasOne(me => me.User)
                    .WithOne(u => u.Mentee)
                    .HasForeignKey<Mentee>(me => me.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(me => me.Mentor)
                    .WithMany(m => m.Mentees)
                    .HasForeignKey(me => me.MentorId)
                    .OnDelete(DeleteBehavior.SetNull);
                    
                entity.Property(e => e.PreferredTopics)
                    .HasColumnType("jsonb");
            });

            modelBuilder.Entity<MentorshipSession>(entity =>
            {
                entity.ToTable("MentorshipSessions");
                entity.HasIndex(e => e.MentorId);
                entity.HasIndex(e => e.MenteeId);
                entity.HasIndex(e => e.ScheduledAt);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                
                entity.HasOne(ms => ms.Mentor)
                    .WithMany(m => m.Sessions)
                    .HasForeignKey(ms => ms.MentorId)
                    .OnDelete(DeleteBehavior.Cascade);
                    
                entity.HasOne(ms => ms.Mentee)
                    .WithMany()
                    .HasForeignKey(ms => ms.MenteeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Post>(entity =>
            {
                entity.ToTable("Posts");
                entity.HasIndex(e => e.PostType);
                entity.HasIndex(e => e.Pinned);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<MediaItem>(entity =>
            {
                entity.ToTable("MediaItems");
                entity.HasIndex(e => e.MediaType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.UploadedAt);
            });

            modelBuilder.Entity<Testimony>(entity =>
            {
                entity.ToTable("Testimonies");
                entity.HasIndex(e => e.Featured);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<HomileticsEntry>(entity =>
            {
                entity.ToTable("HomileticsEntries");
                entity.HasIndex(e => e.UploadedAt);
                entity.HasIndex(e => e.ExpiresAt);
            });

            modelBuilder.Entity<Suggestion>(entity =>
            {
                entity.ToTable("Suggestions");
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<PrayerRequest>(entity =>
            {
                entity.ToTable("PrayerRequests");
                entity.HasIndex(e => e.Urgency);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.MissionaryId);
                entity.HasIndex(e => e.PostedById);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("Comments");
                entity.HasIndex(e => new { e.ParentType, e.ParentId });
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<Like>(entity =>
            {
                entity.ToTable("Likes");
                entity.HasIndex(e => new { e.UserId, e.ParentType, e.ParentId }).IsUnique();
                entity.HasIndex(e => new { e.ParentType, e.ParentId });
            });

            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs");
                entity.HasIndex(e => e.ActionType);
                entity.HasIndex(e => e.TargetTable);
                entity.HasIndex(e => e.Timestamp);
            });

            modelBuilder.Entity<Donation>(entity =>
            {
                entity.ToTable("Donations");
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.DonationType);
                entity.HasIndex(e => e.CreatedAt);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<DonationCampaign>(entity =>
            {
                entity.ToTable("DonationCampaigns");
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.Property(e => e.GoalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.CurrentAmount).HasColumnType("decimal(18,2)");
            });

            modelBuilder.Entity<Outreach>(entity =>
            {
                entity.ToTable("Outreaches");
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            modelBuilder.Entity<OutreachReport>(entity =>
            {
                entity.ToTable("OutreachReports");
                entity.HasIndex(e => e.OutreachId);
                entity.HasIndex(e => e.CreatedAt);
            });
        }
    }
}