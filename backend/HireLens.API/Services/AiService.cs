using System.Text;
using Anthropic;
using Anthropic.Exceptions;
using Anthropic.Models.Beta.Messages;
using HireLens.API.Models;

namespace HireLens.API.Services
{
    public class AiOptions
    {
        public string? ApiKey { get; set; }
        public string Model { get; set; } = "claude-opus-5-5";
        public int MaxTokens { get; set; } = 16000;
    }

    public class AiNotConfiguredException() : Exception("AI is not configured. Set the ANTHROPIC_API_KEY environment variable (or Ai:ApiKey) and restart the API.");
    public class AiGenerationException(string message, Exception? inner = null) : Exception(message, inner);

    public interface IAiService
    {
        Task<string> GenerateAsync(DocumentType type, AppUser user, JobApplication job, CancellationToken ct = default);
    }

    public class ClaudeAiService : IAiService
    {
        private readonly AiOptions _options;
        private readonly AnthropicClient? _client;
        private readonly ILogger<ClaudeAiService> _logger;

        public ClaudeAiService(AiOptions options, ILogger<ClaudeAiService> logger)
        {
            _options = options;
            _logger = logger;
            if (!string.IsNullOrWhiteSpace(options.ApiKey))
            {
                _client = new AnthropicClient { ApiKey = options.ApiKey };
            }
        }

        public async Task<string> GenerateAsync(DocumentType type, AppUser user, JobApplication job, CancellationToken ct = default)
        {
            if (_client is null) throw new AiNotConfiguredException();

            BetaMessage response;
            try
            {
                response = await _client.Beta.Messages.Create(new MessageCreateParams
                {
                    Model = _options.Model,
                    MaxTokens = _options.MaxTokens,
                    // If a request is declined by a safety classifier, the API re-serves it on a fallback model.
                    Betas = ["server-side-fallback-2026-07-01"],
                    Fallbacks = new Default(),
                    OutputConfig = new BetaOutputConfig { Effort = Effort.Medium },
                    System = SystemPrompt(type),
                    Messages = [new BetaUserMessageParam { Content = BuildContext(type, user, job) }],
                }, ct);
            }
            catch (AnthropicRateLimitException ex)
            {
                throw new AiGenerationException("The AI service is rate limited right now. Please try again in a minute.", ex);
            }
            catch (AnthropicApiException ex)
            {
                _logger.LogError(ex, "Claude API call failed");
                throw new AiGenerationException("The AI service returned an error. Please try again.", ex);
            }

            if (response.StopReason == "refusal")
            {
                throw new AiGenerationException("The AI declined to generate this document. Try adjusting the job description or your resume.");
            }

            var text = string.Join("\n", response.Content
                .Select(b => b.TryPickText(out var t) ? t.Text : null)
                .Where(t => t is not null));

            if (string.IsNullOrWhiteSpace(text))
                throw new AiGenerationException("The AI returned an empty response. Please try again.");

            return text.Trim();
        }

        private static string SystemPrompt(DocumentType type) => type switch
        {
            DocumentType.Resume =>
                """
                You are an expert resume writer and career coach. Rewrite the candidate's resume so it is tailored to the
                target job: reorder and rephrase experience to foreground the most relevant skills, mirror important
                keywords from the job description where they are truthful, and quantify impact where the source supports it.
                Never invent employers, titles, dates, degrees, certifications, or metrics that are not in the source resume.
                Output only the resume in clean Markdown (a name heading, a short summary, then sections such as
                Experience, Skills, Education). No preamble or commentary.
                """,
            DocumentType.CoverLetter =>
                """
                You are an expert career coach who writes concise, specific cover letters. Write a cover letter for the
                candidate applying to the target job, grounded only in facts from their resume. Connect two or three of their
                strongest relevant experiences to the job's needs, show genuine interest in the company, and keep it to
                roughly 250-400 words in three to five paragraphs. Avoid clichés and generic filler.
                Output only the letter in Markdown, starting with the greeting. No preamble or commentary.
                """,
            DocumentType.InterviewPrep =>
                """
                You are an experienced hiring manager and interview coach. Prepare the candidate for an interview for the
                target job. Produce Markdown with these sections:
                ## Behavioral questions (5) - for each, a short note on what the interviewer is probing and which experience
                from the candidate's resume to draw on, framed for the STAR method.
                ## Technical / role-specific questions (5) - for each, key points a strong answer covers.
                ## Questions to ask the interviewer (3)
                ## Gaps to prepare for - requirements in the posting the resume doesn't clearly show, and how to address them.
                Be specific to this job and this candidate. No preamble.
                """,
            _ => throw new ArgumentOutOfRangeException(nameof(type)),
        };

        private static string BuildContext(DocumentType type, AppUser user, JobApplication job)
        {
            var sb = new StringBuilder();
            sb.AppendLine("<target_job>");
            sb.AppendLine($"Title: {job.JobTitle}");
            sb.AppendLine($"Company: {job.Company}");
            if (!string.IsNullOrWhiteSpace(job.Location)) sb.AppendLine($"Location: {job.Location}");
            sb.AppendLine("Job description:");
            sb.AppendLine(string.IsNullOrWhiteSpace(job.JobDescription) ? "(not provided - infer typical requirements from the title)" : job.JobDescription);
            sb.AppendLine("</target_job>");
            sb.AppendLine();
            sb.AppendLine("<candidate>");
            if (!string.IsNullOrWhiteSpace(user.FullName)) sb.AppendLine($"Name: {user.FullName}");
            sb.AppendLine("Resume:");
            sb.AppendLine(user.BaseResume);
            sb.AppendLine("</candidate>");
            sb.AppendLine();
            sb.AppendLine(type switch
            {
                DocumentType.Resume => "Write the tailored resume.",
                DocumentType.CoverLetter => "Write the cover letter.",
                _ => "Write the interview prep guide.",
            });
            return sb.ToString();
        }
    }
}
