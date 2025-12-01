using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class User : IdentityUser
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "student";

        [MaxLength(200)]
        public string? ProfilePhoto { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        public string PrivacySettings { get; set; } = "{}";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginDateUtc { get; set; }

        // Navigation properties
        public virtual Student? Student { get; set; }
        public virtual Alumni? Alumni { get; set; }
        public virtual Missionary? Missionary { get; set; }
        public virtual Mentor? Mentor { get; set; }
        public virtual Mentee? Mentee { get; set; }
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<Testimony> Testimonies { get; set; } = new List<Testimony>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
        public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
        public virtual ICollection<OneTimeLoginToken> LoginTokens { get; set; } = new List<OneTimeLoginToken>();
        public virtual ICollection<PrayerRequest> PrayerRequests { get; set; } = new List<PrayerRequest>();
    }

    public class OneTimeLoginToken
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        [MaxLength(64)]
        public string Token { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime ExpiresAt { get; set; }

        public bool Used { get; set; } = false;

        public DateTime? UsedAt { get; set; }

        [MaxLength(45)]
        public string? IpAddress { get; set; }

        public bool IsValid()
        {
            return !Used && DateTime.UtcNow < ExpiresAt;
        }

        public void MarkAsUsed(string? ipAddress = null)
        {
            Used = true;
            UsedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(ipAddress))
            {
                IpAddress = ipAddress;
            }
        }
    }

    public class Student
    {
        [Key]
        [ForeignKey("User")]
        public string UserId { get; set; } = null!;

        public virtual User User { get; set; } = null!;

        [Required]
        public DateTime EnrollmentDate { get; set; }

        public DateTime? GraduationDate { get; set; }

        [MaxLength(100)]
        public string? Program { get; set; }

        [MaxLength(50)]
        public string? ClassYear { get; set; }

        [Column(TypeName = "jsonb")]
        public string Tags { get; set; } = "[]";

        public string? Notes { get; set; }

        // Navigation properties
        public virtual ICollection<HomileticsEntry> HomileticsEntries { get; set; } = new List<HomileticsEntry>();
    }

    public class Alumni
    {
        [Key]
        [ForeignKey("User")]
        public string UserId { get; set; } = null!;

        public virtual User User { get; set; } = null!;

        [Required]
        public int GraduationYear { get; set; }

        [MaxLength(200)]
        public string? CurrentLocation { get; set; }

        public string? Bio { get; set; }

        [Column(TypeName = "jsonb")]
        public string Skills { get; set; } = "[]";

        [Column(TypeName = "jsonb")]
        public string PublicContact { get; set; } = "{}";

        [Column(TypeName = "jsonb")]
        public string LinkedProfiles { get; set; } = "{}";
    }

    public class Missionary
    {
        [Key]
        [ForeignKey("User")]
        public string UserId { get; set; } = null!;

        public virtual User User { get; set; } = null!;

        [MaxLength(200)]
        public string? Photo { get; set; }

        [MaxLength(100)]
        public string? LocationCountry { get; set; }

        [MaxLength(100)]
        public string? OriginalCountry { get; set; }

        [MaxLength(200)]
        public string? SendingOrganization { get; set; }

        public string? Bio { get; set; }

        public string? MinistryDescription { get; set; }

        [MaxLength(50)]
        public string? ContactPreference { get; set; }

        [MaxLength(20)]
        public string ActiveStatus { get; set; } = "active";

        public int? LatestUpdateId { get; set; }

        [ForeignKey("LatestUpdateId")]
        public virtual Post? LatestUpdate { get; set; }

        // Navigation properties
        public virtual ICollection<PrayerRequest> PrayerRequests { get; set; } = new List<PrayerRequest>();
    }

    public class Mentor
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string AreaOfExpertise { get; set; } = null!;

        [MaxLength(500)]
        public string? Bio { get; set; }

        [Column(TypeName = "jsonb")]
        public string Availability { get; set; } = "{}";

        [Column(TypeName = "jsonb")]
        public string CommunicationChannels { get; set; } = "[]";

        public int MaxMentees { get; set; } = 5;

        public int CurrentMentees { get; set; } = 0;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Mentee> Mentees { get; set; } = new List<Mentee>();
        public virtual ICollection<MentorshipSession> Sessions { get; set; } = new List<MentorshipSession>();
    }

    public class Mentee
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        public int? MentorId { get; set; }

        [ForeignKey("MentorId")]
        public virtual Mentor? Mentor { get; set; }

        [Required]
        [MaxLength(100)]
        public string LearningGoals { get; set; } = null!;

        [MaxLength(500)]
        public string? Background { get; set; }

        [Column(TypeName = "jsonb")]
        public string PreferredTopics { get; set; } = "[]";

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class MentorshipSession
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MentorId { get; set; }

        [ForeignKey("MentorId")]
        public virtual Mentor Mentor { get; set; } = null!;

        [Required]
        public int MenteeId { get; set; }

        [ForeignKey("MenteeId")]
        public virtual Mentee Mentee { get; set; } = null!;

        [Required]
        public DateTime ScheduledAt { get; set; }

        public int DurationMinutes { get; set; } = 60;

        [MaxLength(100)]
        public string? MeetingLink { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? Agenda { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "scheduled";

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Post
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AuthorId { get; set; } = null!;

        [ForeignKey("AuthorId")]
        public virtual User Author { get; set; } = null!;

        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Body { get; set; }

        [MaxLength(20)]
        public string PostType { get; set; } = "announcement";

        public string Attachments { get; set; } = "[]";

        public bool AllowComments { get; set; } = true;

        public bool AllowLikes { get; set; } = true;

        public bool Pinned { get; set; } = false;

        public string Tags { get; set; } = "[]";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ScheduledAt { get; set; }
    }

    public class MediaItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string OwnerId { get; set; } = null!;

        [ForeignKey("OwnerId")]
        public virtual User Owner { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string MediaType { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string File { get; set; } = null!;

        [MaxLength(500)]
        public string? Thumbnail { get; set; }

        public int? Duration { get; set; }

        [Required]
        public long SizeBytes { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public DateTime? ExpiresAt { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "active";
    }

    public class Testimony
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AuthorId { get; set; } = null!;

        [ForeignKey("AuthorId")]
        public virtual User Author { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Body { get; set; } = null!;

        [Column(TypeName = "jsonb")]
        public string Attachments { get; set; } = "[]";

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? OutreachTag { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool Featured { get; set; } = false;
    }

    public class HomileticsEntry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string StudentId { get; set; } = null!;

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string SermonDoc { get; set; } = null!;

        [Required]
        [MaxLength(500)]
        public string AudioFile { get; set; } = null!;

        [Required]
        public int AudioDuration { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime ExpiresAt { get; set; }
    }

    public class Suggestion
    {
        [Key]
        public int Id { get; set; }

        public string? SubmitterId { get; set; }

        [ForeignKey("SubmitterId")]
        public virtual User? Submitter { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        [Required]
        public string Body { get; set; } = null!;

        [MaxLength(20)]
        public string Category { get; set; } = "other";

        [Column(TypeName = "jsonb")]
        public string Attachments { get; set; } = "[]";

        [Column(TypeName = "jsonb")]
        public string ContactInfo { get; set; } = "{}";

        public bool Anonymous { get; set; } = true;

        [MaxLength(20)]
        public string Status { get; set; } = "pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? ModeratedById { get; set; }

        [ForeignKey("ModeratedById")]
        public virtual User? ModeratedBy { get; set; }
    }

    public class PrayerRequest
    {
        [Key]
        public int Id { get; set; }

        public string? MissionaryId { get; set; }

        [ForeignKey("MissionaryId")]
        public virtual Missionary? Missionary { get; set; }

        [Required]
        public string Text { get; set; } = null!;

        [MaxLength(20)]
        public string Urgency { get; set; } = "medium";

        [Column(TypeName = "jsonb")]
        public string Images { get; set; } = "[]";

        [Required]
        public string PostedById { get; set; } = null!;

        [ForeignKey("PostedById")]
        public virtual User PostedBy { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int PrayerCount { get; set; } = 0;

        [MaxLength(20)]
        public string Status { get; set; } = "active";

        public DateTime? AnsweredAt { get; set; }
    }

    public class Comment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AuthorId { get; set; } = null!;

        [ForeignKey("AuthorId")]
        public virtual User Author { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string ParentType { get; set; } = null!;

        [Required]
        public int ParentId { get; set; }

        [Required]
        public string Text { get; set; } = null!;

        [Column(TypeName = "jsonb")]
        public string Attachments { get; set; } = "[]";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? EditedAt { get; set; }
    }

    public class Like
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string ParentType { get; set; } = null!;

        [Required]
        public int ParentId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ActorId { get; set; } = null!;

        [ForeignKey("ActorId")]
        public virtual User Actor { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string ActionType { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string TargetTable { get; set; } = null!;

        [Required]
        public int TargetId { get; set; }

        [Column(TypeName = "jsonb")]
        public string Diff { get; set; } = "{}";

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class Donation
    {
        [Key]
        public int Id { get; set; }

        public string? DonorId { get; set; }

        [ForeignKey("DonorId")]
        public virtual User? Donor { get; set; }

        [Required]
        [MaxLength(100)]
        public string DonorName { get; set; } = null!;

        [MaxLength(200)]
        public string? DonorEmail { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Currency { get; set; } = "USD";

        [Required]
        [MaxLength(50)]
        public string DonationType { get; set; } = "general";

        [MaxLength(200)]
        public string? TargetId { get; set; }

        [MaxLength(500)]
        public string? Purpose { get; set; }

        public string? Message { get; set; }

        public bool Anonymous { get; set; } = false;

        [Required]
        [MaxLength(20)]
        public string PaymentMethod { get; set; } = "card";

        [MaxLength(100)]
        public string? TransactionReference { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        [MaxLength(500)]
        public string? ReceiptUrl { get; set; }

        public bool ReceiptSent { get; set; } = false;

        public string? Notes { get; set; }
    }

    public class DonationCampaign
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? GoalAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentAmount { get; set; } = 0;

        [MaxLength(20)]
        public string Currency { get; set; } = "USD";

        [MaxLength(500)]
        public string? CoverImage { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active";

        [Required]
        public string CreatedById { get; set; } = null!;

        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }

    public class Outreach
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "ongoing";

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string Leader { get; set; } = null!;

        [Column(TypeName = "jsonb")]
        public string Activities { get; set; } = "[]";

        public string Description { get; set; } = null!;

        [Column(TypeName = "jsonb")]
        public string Photos { get; set; } = "[]";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<OutreachReport> Reports { get; set; } = new List<OutreachReport>();
    }

    public class OutreachReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OutreachId { get; set; }

        [ForeignKey("OutreachId")]
        public virtual Outreach Outreach { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Author { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Column(TypeName = "jsonb")]
        public string Photos { get; set; } = "[]";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}