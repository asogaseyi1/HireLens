using Microsoft.AspNetCore.Identity;

namespace HireLens.API.Models
{
    // Uses Identity's default string Id (GUID). Overriding it with an int breaks Identity's key mapping.
    public class AppUser : IdentityUser
    {
        public string? FullName { get; set; }

        // The user's "master" resume / background. The AI tailors this to each job.
        public string? BaseResume { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
    }
}
