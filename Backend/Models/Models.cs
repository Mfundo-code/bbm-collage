// Add to Backend/Models/Models.cs

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
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
        public string DonationType { get; set; } = "general"; // general, missionary, project, tithe

        [MaxLength(200)]
        public string? TargetId { get; set; } // Missionary ID, Project ID, etc.

        [MaxLength(500)]
        public string? Purpose { get; set; }

        public string? Message { get; set; }

        public bool Anonymous { get; set; } = false;

        [Required]
        [MaxLength(20)]
        public string PaymentMethod { get; set; } = "card"; // card, bank_transfer, mobile_money, cash

        [MaxLength(100)]
        public string? TransactionReference { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, completed, failed, refunded

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
        public string Status { get; set; } = "active"; // active, completed, paused, closed

        [Required]
        public string CreatedById { get; set; } = null!;

        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();
    }
}

// Add to Backend/DTOs/DTOs.cs

namespace Backend.DTOs
{
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
}