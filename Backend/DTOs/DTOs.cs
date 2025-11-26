using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // User DTOs
    public class UserDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Role { get; set; } = null!;
        public string? ProfilePhoto { get; set; }
        public string? ContactPhone { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserCreateDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string FirstName { get; set; } = null!;

        [Required]
        public string LastName { get; set; } = null!;

        [Required]
        public string Role { get; set; } = null!;

        public string? ContactPhone { get; set; }
    }

    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = null!;
        public UserDto User { get; set; } = null!;
    }

    public class AutoLoginDto
    {
        [Required]
        public string Token { get; set; } = null!;
    }

    // Post DTOs
    public class PostDto
    {
        public int Id { get; set; }
        public UserDto Author { get; set; } = null!;
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string PostType { get; set; } = null!;
        public List<string> Attachments { get; set; } = new();
        public bool AllowComments { get; set; }
        public bool AllowLikes { get; set; }
        public bool Pinned { get; set; }
        public List<string> Tags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
    }

    public class PostCreateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        public string? Body { get; set; }

        [Required]
        public string PostType { get; set; } = "announcement";

        public List<string> Attachments { get; set; } = new();
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public bool Pinned { get; set; } = false;
        public List<string> Tags { get; set; } = new();
        public DateTime? ScheduledAt { get; set; }
    }

    // Testimony DTOs
    public class TestimonyDto
    {
        public int Id { get; set; }
        public UserDto Author { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Body { get; set; } = null!;
        public List<string> Attachments { get; set; } = new();
        public string? Location { get; set; }
        public string? OutreachTag { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Featured { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
    }

    public class TestimonyCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Body { get; set; } = null!;

        public List<string> Attachments { get; set; } = new();

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(100)]
        public string? OutreachTag { get; set; }
    }

    // Suggestion DTOs
    public class SuggestionDto
    {
        public int Id { get; set; }
        public UserDto? Submitter { get; set; }
        public string? Title { get; set; }
        public string Body { get; set; } = null!;
        public string Category { get; set; } = null!;
        public List<string> Attachments { get; set; } = new();
        public Dictionary<string, string> ContactInfo { get; set; } = new();
        public bool Anonymous { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public UserDto? ModeratedBy { get; set; }
    }

    public class SuggestionCreateDto
    {
        [MaxLength(200)]
        public string? Title { get; set; }

        [Required]
        public string Body { get; set; } = null!;

        [Required]
        public string Category { get; set; } = "other";

        public List<string> Attachments { get; set; } = new();
        public Dictionary<string, string> ContactInfo { get; set; } = new();
        public bool Anonymous { get; set; } = true;
    }

    // Prayer Request DTOs
    public class PrayerRequestDto
    {
        public int Id { get; set; }
        public MissionaryDto Missionary { get; set; } = null!;
        public string Text { get; set; } = null!;
        public string Urgency { get; set; } = null!;
        public List<string> Images { get; set; } = new();
        public UserDto PostedBy { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int PrayerCount { get; set; }
    }

    public class PrayerRequestCreateDto
    {
        [Required]
        public string MissionaryId { get; set; } = null!;

        [Required]
        public string Text { get; set; } = null!;

        [Required]
        public string Urgency { get; set; } = "medium";

        public List<string> Images { get; set; } = new();
    }

    // Comment DTOs
    public class CommentDto
    {
        public int Id { get; set; }
        public UserDto Author { get; set; } = null!;
        public string ParentType { get; set; } = null!;
        public int ParentId { get; set; }
        public string Text { get; set; } = null!;
        public List<string> Attachments { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
    }

    public class CommentCreateDto
    {
        [Required]
        public string ParentType { get; set; } = null!;

        [Required]
        public int ParentId { get; set; }

        [Required]
        public string Text { get; set; } = null!;

        public List<string> Attachments { get; set; } = new();
    }

    // Like DTOs
    public class LikeDto
    {
        public int Id { get; set; }
        public UserDto User { get; set; } = null!;
        public string ParentType { get; set; } = null!;
        public int ParentId { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ToggleLikeDto
    {
        [Required]
        public string ParentType { get; set; } = null!;

        [Required]
        public int ParentId { get; set; }
    }

    // Student DTOs
    public class StudentDto
    {
        public UserDto User { get; set; } = null!;
        public DateTime EnrollmentDate { get; set; }
        public DateTime? GraduationDate { get; set; }
        public string? Program { get; set; }
        public string? ClassYear { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? Notes { get; set; }
    }

    // Alumni DTOs
    public class AlumniDto
    {
        public UserDto User { get; set; } = null!;
        public int GraduationYear { get; set; }
        public string? CurrentLocation { get; set; }
        public string? Bio { get; set; }
        public List<string> Skills { get; set; } = new();
        public Dictionary<string, string> PublicContact { get; set; } = new();
        public Dictionary<string, string> LinkedProfiles { get; set; } = new();
    }

    // Missionary DTOs (updated)
    public class MissionaryDto
    {
        public UserDto User { get; set; } = null!;
        public string? Photo { get; set; }
        public string? LocationCountry { get; set; }
        public string? OriginalCountry { get; set; }
        public string? SendingOrganization { get; set; }
        public string? Bio { get; set; }
        public string? MinistryDescription { get; set; }
        public string? ContactPreference { get; set; }
        public string ActiveStatus { get; set; } = null!;
        public PostDto? LatestUpdate { get; set; }
    }

    public class MissionaryCreateDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = null!;

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(200)]
        public string? ProfilePhoto { get; set; }

        public string? Bio { get; set; }

        public string? MinistryDescription { get; set; }

        [MaxLength(200)]
        public string? Organization { get; set; }

        [MaxLength(100)]
        public string? OriginalCountry { get; set; }

        [MaxLength(100)]
        public string? MissionCountry { get; set; }

        [MaxLength(50)]
        public string? ContactPreference { get; set; }
    }

    public class MissionaryUpdateDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(200)]
        public string? ProfilePhoto { get; set; }

        public string? Bio { get; set; }

        public string? MinistryDescription { get; set; }

        [MaxLength(200)]
        public string? Organization { get; set; }

        [MaxLength(100)]
        public string? OriginalCountry { get; set; }

        [MaxLength(100)]
        public string? MissionCountry { get; set; }

        [MaxLength(50)]
        public string? ContactPreference { get; set; }

        [MaxLength(20)]
        public string? ActiveStatus { get; set; }
    }

    // Homiletics DTOs
    public class HomileticsEntryDto
    {
        public int Id { get; set; }
        public UserDto Student { get; set; } = null!;
        public string StudentId { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string SermonDoc { get; set; } = null!;
        public string AudioFile { get; set; } = null!;
        public int AudioDuration { get; set; }
        public DateTime UploadedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        
    }

    public class HomileticsEntryCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string SermonDoc { get; set; } = null!;

        [Required]
        public string AudioFile { get; set; } = null!;

        [Required]
        public int AudioDuration { get; set; }

        [Required]
        public DateTime ExpiresAt { get; set; }

        [Required]
        public string StudentId { get; set; } = null!;
    }

    // Media DTOs
    public class MediaItemDto
    {
        public int Id { get; set; }
        public UserDto Owner { get; set; } = null!;
        public string MediaType { get; set; } = null!;
        public string File { get; set; } = null!;
        public string? Thumbnail { get; set; }
        public int? Duration { get; set; }
        public long SizeBytes { get; set; }
        public DateTime UploadedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Status { get; set; } = null!;
    }
}
