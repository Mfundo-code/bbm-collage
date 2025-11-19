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

        [Column(TypeName = "jsonb")]
        public string PrivacySettings { get; set; } = "{}";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? LastLoginDateUtc { get; set; }

        // Navigation properties
        public virtual Student? Student { get; set; }
        public virtual Alumni? Alumni { get; set; }
        public virtual Missionary? Missionary { get; set; }
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
        public virtual ICollection<Testimony> Testimonies { get; set; } = new List<Testimony>();
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
        public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
        public virtual ICollection<OneTimeLoginToken> LoginTokens { get; set; } = new List<OneTimeLoginToken>();
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
}