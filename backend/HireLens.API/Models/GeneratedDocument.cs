namespace HireLens.API.Models
{
    public enum DocumentType
    {
        Resume,
        CoverLetter,
        InterviewPrep
    }

    // An AI-generated artifact (tailored resume, cover letter, or interview prep) for one application.
    public class GeneratedDocument
    {
        public int Id { get; set; }

        public DocumentType Type { get; set; }

        // Markdown content
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int JobApplicationId { get; set; }
        public JobApplication? JobApplication { get; set; }
    }
}
