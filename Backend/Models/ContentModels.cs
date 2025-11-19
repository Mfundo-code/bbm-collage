using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
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

        [Column(TypeName = "jsonb")]
        public string Attachments { get; set; } = "[]";

        public bool AllowComments { get; set; } = true;

        public bool AllowLikes { get; set; } = true;

        public bool Pinned { get; set; } = false;

        [Column(TypeName = "jsonb")]
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

        [Required]
        public string MissionaryId { get; set; } = null!;

        [ForeignKey("MissionaryId")]
        public virtual Missionary Missionary { get; set; } = null!;

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
}