using System.ComponentModel.DataAnnotations;
using HireLens.API.Models;

namespace HireLens.API.Dtos
{
    // ---- Auth ----
    public record RegisterRequest(
        [Required, EmailAddress] string Email,
        [Required, MinLength(8)] string Password,
        string? FullName);

    public record LoginRequest(
        [Required, EmailAddress] string Email,
        [Required] string Password);

    public record UserDto(string Id, string Email, string? FullName);

    public record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);

    // ---- Profile ----
    public record ProfileDto(string Email, string? FullName, string? BaseResume);

    public record UpdateProfileRequest(
        [MaxLength(200)] string? FullName,
        string? BaseResume);

    // ---- Job applications ----
    public record JobApplicationRequest(
        [Required, MaxLength(200)] string JobTitle,
        [Required, MaxLength(200)] string Company,
        [MaxLength(200)] string? Location,
        [MaxLength(2048)] string? JobLink,
        string? JobDescription,
        ApplicationStatus Status,
        DateTime? AppliedDate,
        string? Notes);

    public record JobApplicationDto(
        int Id,
        string JobTitle,
        string Company,
        string? Location,
        string? JobLink,
        string? JobDescription,
        ApplicationStatus Status,
        DateTime? AppliedDate,
        string? Notes,
        DateTime CreatedAt,
        DateTime UpdatedAt)
    {
        public static JobApplicationDto From(JobApplication a) => new(
            a.Id, a.JobTitle, a.Company, a.Location, a.JobLink, a.JobDescription,
            a.Status, a.AppliedDate, a.Notes, a.CreatedAt, a.UpdatedAt);
    }

    // ---- Generated documents ----
    public record GenerateDocumentRequest([Required] DocumentType Type);

    public record GeneratedDocumentDto(int Id, int JobApplicationId, DocumentType Type, string Content, DateTime CreatedAt)
    {
        public static GeneratedDocumentDto From(GeneratedDocument d) =>
            new(d.Id, d.JobApplicationId, d.Type, d.Content, d.CreatedAt);
    }
}
