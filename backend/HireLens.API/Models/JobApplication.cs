using System.ComponentModel.DataAnnotations;

namespace HireLens.API.Models
{
    public enum ApplicationStatus
    {
        Wishlist,
        Applied,
        Interviewing,
        Offer,
        Rejected,
        Withdrawn
    }

    public class JobApplication
    {
        public int Id { get; set; }

        [Required, MaxLength(200)]
        public string JobTitle { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Company { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(2048)]
        public string? JobLink { get; set; }

        // Pasted job posting text. Used as context for AI generation.
        public string? JobDescription { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;

        public DateTime? AppliedDate { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public string AppUserId { get; set; } = string.Empty;
        public AppUser? AppUser { get; set; }

        public ICollection<GeneratedDocument> Documents { get; set; } = new List<GeneratedDocument>();
    }
}
