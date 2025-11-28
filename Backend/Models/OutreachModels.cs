using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Outreach
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "ongoing"; // ongoing, completed

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

        // Navigation property
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