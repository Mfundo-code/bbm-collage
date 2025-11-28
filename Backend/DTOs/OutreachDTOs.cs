using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
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
}