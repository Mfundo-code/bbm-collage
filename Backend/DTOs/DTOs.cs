// Backend/DTOs/DTOs.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    // Authentication DTOs
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
        public DateTime? LastLoginDateUtc { get; set; }
    }

    public class UserCreateDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = null!;

        [MaxLength(100)]
        public string? LastName { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "student";

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        public string? ProfilePhoto { get; set; }
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
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public bool Pinned { get; set; } = false;
        public List<string> Tags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
    }

    public class PostCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        [Required]
        public string PostType { get; set; } = null!;
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
        public bool Featured { get; set; } = false;
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
        public bool Anonymous { get; set; } = true;
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

        [MaxLength(20)]
        public string Category { get; set; } = "other";

        public List<string> Attachments { get; set; } = new();
        public Dictionary<string, string> ContactInfo { get; set; } = new();
        public bool Anonymous { get; set; } = true;
    }

    public class UpdateSuggestionStatusDto
    {
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = null!; // pending, reviewed, approved, rejected
    }

    // Missionary DTOs
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
        public string ActiveStatus { get; set; } = "active";
        public PostDto? LatestUpdate { get; set; }
    }

    public class MissionaryCreateDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = null!;

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(200)]
        public string? ProfilePhoto { get; set; }

        [MaxLength(100)]
        public string? MissionCountry { get; set; }

        [MaxLength(200)]
        public string? Organization { get; set; }

        public string? Bio { get; set; }
        public string? MinistryDescription { get; set; }
        public string? ContactPreference { get; set; }
        public string? OriginalCountry { get; set; }
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

        [MaxLength(100)]
        public string? MissionCountry { get; set; }

        [MaxLength(200)]
        public string? Organization { get; set; }

        public string? Bio { get; set; }
        public string? MinistryDescription { get; set; }
        public string? ContactPreference { get; set; }
        public string? OriginalCountry { get; set; }
        public string? ActiveStatus { get; set; }
    }

    // Prayer Request DTOs
    public class PrayerRequestDto
    {
        public int Id { get; set; }
        public MissionaryDto? Missionary { get; set; } // Now optional
        public string Text { get; set; } = null!;
        public string Urgency { get; set; } = null!;
        public List<string> Images { get; set; } = new();
        public UserDto PostedBy { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int PrayerCount { get; set; }
        public string? Status { get; set; } = "active";
        public bool IsAnswered => Status == "answered";
    }

    public class PrayerRequestCreateDto
    {
        [Required]
        public string Text { get; set; } = null!;

        [MaxLength(20)]
        public string Urgency { get; set; } = "medium";

        public List<string> Images { get; set; } = new();
        
        public string? MissionaryId { get; set; } // Optional
    }

    // Prayer Wall DTOs
    public class PrayerWallDto
    {
        public int Id { get; set; }
        public MissionaryDto? Missionary { get; set; } // Now optional
        public string Text { get; set; } = null!;
        public string Urgency { get; set; } = null!;
        public string? Status { get; set; } = "active";
        public List<string> Images { get; set; } = new();
        public UserDto PostedBy { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int PrayerCount { get; set; }
        public bool IsAnswered => Status == "answered";
        public DateTime? AnsweredAt { get; set; }
    }

    public class PrayerWallCreateDto
    {
        [Required]
        public string Text { get; set; } = null!;
        
        [MaxLength(20)]
        public string? Urgency { get; set; } = "medium";
        
        public string? MissionaryId { get; set; } // Optional - for missionary-specific prayers
        
        public List<string> Images { get; set; } = new();
    }

    public class PrayerWallUpdateDto
    {
        public string? Text { get; set; }
        public string? Urgency { get; set; }
        public List<string>? Images { get; set; }
        public string? Status { get; set; } // For marking as answered
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

    public class AlumniCreateDto
    {
        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = null!;

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [MaxLength(200)]
        public string? ProfilePhoto { get; set; }

        [Required]
        [Range(1900, 2100)]
        public int GraduationYear { get; set; }

        [MaxLength(200)]
        public string? CurrentLocation { get; set; }

        public string? Bio { get; set; }
        public List<string> Skills { get; set; } = new();
        public Dictionary<string, string> PublicContact { get; set; } = new();
        public Dictionary<string, string> LinkedProfiles { get; set; } = new();
    }

    public class AlumniUpdateDto
    {
        [MaxLength(200)]
        public string? CurrentLocation { get; set; }
        
        public string? Bio { get; set; }
        public List<string> Skills { get; set; } = new();
        public Dictionary<string, string> PublicContact { get; set; } = new();
        public Dictionary<string, string> LinkedProfiles { get; set; } = new();
    }

    // Homiletics DTOs
    public class HomileticsEntryDto
    {
        public int Id { get; set; }
        public UserDto Student { get; set; } = null!;
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
        public string StudentId { get; set; } = null!;

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
        [Range(1, 3600)]
        public int AudioDuration { get; set; }

        public DateTime ExpiresAt { get; set; }
    }

    // Donation DTOs
    public class DonationDto
    {
        public int Id { get; set; }
        public UserDto? Donor { get; set; }
        public string DonorName { get; set; } = null!;
        public string? DonorEmail { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = null!;
        public string DonationType { get; set; } = null!;
        public string? TargetId { get; set; }
        public string? Purpose { get; set; }
        public string? Message { get; set; }
        public bool Anonymous { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string? TransactionReference { get; set; }
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ReceiptUrl { get; set; }
        public bool ReceiptSent { get; set; }
    }

    public class DonationCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string DonorName { get; set; } = null!;

        [EmailAddress]
        public string? DonorEmail { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "USD";

        [Required]
        public string DonationType { get; set; } = "general";

        public string? TargetId { get; set; }

        public string? Purpose { get; set; }

        public string? Message { get; set; }

        public bool Anonymous { get; set; } = false;

        [Required]
        public string PaymentMethod { get; set; } = "card";

        public string? TransactionReference { get; set; }
    }

    public class UpdateDonationStatusDto
    {
        [Required]
        public string Status { get; set; } = null!; // pending, completed, failed, refunded
        public string? Notes { get; set; }
    }

    public class DonationCampaignDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal? GoalAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public string Currency { get; set; } = null!;
        public string? CoverImage { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = null!;
        public UserDto CreatedBy { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public int DonationCount { get; set; }
        public decimal PercentageReached { get; set; }
    }

    public class DonationCampaignCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        public decimal? GoalAmount { get; set; }

        public string Currency { get; set; } = "USD";

        public string? CoverImage { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }

    // Outreach DTOs
    public class OutreachDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Location { get; set; } = null!;
        public string Leader { get; set; } = null!;
        public List<string> Activities { get; set; } = new();
        public string Description { get; set; } = null!;
        public List<string> Photos { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public List<OutreachReportDto> Reports { get; set; } = new();
    }

    public class OutreachCreateDto
    {
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

        public List<string> Activities { get; set; } = new();

        [Required]
        public string Description { get; set; } = null!;

        public List<string> Photos { get; set; } = new();
    }

    public class OutreachReportDto
    {
        public int Id { get; set; }
        public int OutreachId { get; set; }
        public string Title { get; set; } = null!;
        public string Author { get; set; } = null!;
        public string Description { get; set; } = null!;
        public List<string> Photos { get; set; } = new();
        public DateTime CreatedAt { get; set; }
    }

    public class OutreachReportCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        public List<string> Photos { get; set; } = new();
    }

    // Interaction DTOs
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

    // Update/Mission Updates DTOs
    public class UpdateCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string> Attachments { get; set; } = new();
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public List<string> Tags { get; set; } = new();
    }

    // Sunday Service DTOs
    public class SundayServiceCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string> Attachments { get; set; } = new();
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public List<string> Tags { get; set; } = new();
    }

    // Announcement DTOs
    public class AnnouncementCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string> Attachments { get; set; } = new();
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public bool Pinned { get; set; } = false;
        public List<string> Tags { get; set; } = new();
        public DateTime? ScheduledAt { get; set; }
    }

    // Media Item DTOs
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

    // Student DTOs
    public class StudentDto
    {
        public string UserId { get; set; } = null!;
        public UserDto User { get; set; } = null!;
        public DateTime EnrollmentDate { get; set; }
        public DateTime? GraduationDate { get; set; }
        public string? Program { get; set; }
        public string? ClassYear { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? Notes { get; set; }
    }

    // Setup DTOs
    public class CreateAdminDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

    // Audit Log DTOs
    public class AuditLogDto
    {
        public int Id { get; set; }
        public UserDto Actor { get; set; } = null!;
        public string ActionType { get; set; } = null!;
        public string TargetTable { get; set; } = null!;
        public int TargetId { get; set; }
        public Dictionary<string, object> Diff { get; set; } = new();
        public DateTime Timestamp { get; set; }
    }
}