using HireLens.API.Data;
using HireLens.API.Dtos;
using HireLens.API.Models;
using HireLens.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.API.Controllers
{
    [ApiController]
    [Authorize]
    public class DocumentsController(ApplicationDbContext db, UserManager<AppUser> users, IAiService ai) : ControllerBase
    {
        [HttpGet("api/applications/{applicationId:int}/documents")]
        public async Task<ActionResult<IEnumerable<GeneratedDocumentDto>>> List(int applicationId)
        {
            var userId = User.GetUserId();
            if (!await db.JobApplications.AnyAsync(a => a.Id == applicationId && a.AppUserId == userId))
                return NotFound();

            var docs = await db.GeneratedDocuments
                .Where(d => d.JobApplicationId == applicationId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
            return docs.Select(GeneratedDocumentDto.From).ToList();
        }

        [HttpPost("api/applications/{applicationId:int}/documents")]
        public async Task<ActionResult<GeneratedDocumentDto>> Generate(int applicationId, GenerateDocumentRequest req, CancellationToken ct)
        {
            var userId = User.GetUserId();
            var app = await db.JobApplications.FirstOrDefaultAsync(a => a.Id == applicationId && a.AppUserId == userId, ct);
            if (app is null) return NotFound();

            var user = await users.FindByIdAsync(userId);
            if (user is null) return Unauthorized();
            if (string.IsNullOrWhiteSpace(user.BaseResume))
                return BadRequest(new ProblemDetails { Title = "Add your base resume on the Profile page before generating documents." });

            string content;
            try
            {
                content = await ai.GenerateAsync(req.Type, user, app, ct);
            }
            catch (AiNotConfiguredException ex)
            {
                return Problem(title: ex.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (AiGenerationException ex)
            {
                return Problem(title: ex.Message, statusCode: StatusCodes.Status502BadGateway);
            }

            var doc = new GeneratedDocument { JobApplicationId = app.Id, Type = req.Type, Content = content };
            db.GeneratedDocuments.Add(doc);
            await db.SaveChangesAsync(ct);
            return GeneratedDocumentDto.From(doc);
        }

        [HttpDelete("api/documents/{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.GetUserId();
            var doc = await db.GeneratedDocuments
                .FirstOrDefaultAsync(d => d.Id == id && d.JobApplication!.AppUserId == userId);
            if (doc is null) return NotFound();

            db.GeneratedDocuments.Remove(doc);
            await db.SaveChangesAsync();
            return NoContent();
        }
    }
}
