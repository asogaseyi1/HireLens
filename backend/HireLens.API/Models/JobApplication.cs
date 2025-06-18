using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HireLens.API.Models
{
    public class JobApplication
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? JobTitle { get; set; }

        [Required]
        public string? Company { get; set; }

        public string? Location { get; set; }

        public string? JobLink { get; set; }

        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Applied"; // Applied, Interview, Offer, Rejected, etc.

        public string? Notes { get; set; }

        // Optional: Add a foreign key to the user who owns this application
        [Required]
        public string? AppUserId { get; set; }

        [ForeignKey("AppUserId")]
        public AppUser? AppUser { get; set; }
    }
}
