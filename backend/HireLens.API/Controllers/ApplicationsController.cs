using HireLens.API.Data;
using HireLens.API.Dtos;
using HireLens.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HireLens.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/applications")]
    public class ApplicationsController(ApplicationDbContext db) : ControllerBase
    {
        private IQueryable<JobApplication> Mine
        {
            get
            {
                var userId = User.GetUserId();
                return db.JobApplications.Where(a => a.AppUserId == userId);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobApplicationDto>>> List([FromQuery] ApplicationStatus? status)
        {
            var query = Mine;
            if (status is not null) query = query.Where(a => a.Status == status);

            var apps = await query.OrderByDescending(a => a.UpdatedAt).ToListAsync();
            return apps.Select(JobApplicationDto.From).ToList();
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<JobApplicationDto>> Get(int id)
        {
            var app = await Mine.FirstOrDefaultAsync(a => a.Id == id);
            return app is null ? NotFound() : JobApplicationDto.From(app);
        }

        [HttpPost]
        public async Task<ActionResult<JobApplicationDto>> Create(JobApplicationRequest req)
        {
            var app = new JobApplication { AppUserId = User.GetUserId() };
            Apply(app, req);
            db.JobApplications.Add(app);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = app.Id }, JobApplicationDto.From(app));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<JobApplicationDto>> Update(int id, JobApplicationRequest req)
        {
            var app = await Mine.FirstOrDefaultAsync(a => a.Id == id);
            if (app is null) return NotFound();

            Apply(app, req);
            app.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return JobApplicationDto.From(app);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var app = await Mine.FirstOrDefaultAsync(a => a.Id == id);
            if (app is null) return NotFound();

            db.JobApplications.Remove(app);
            await db.SaveChangesAsync();
            return NoContent();
        }

        private static void Apply(JobApplication app, JobApplicationRequest req)
        {
            app.JobTitle = req.JobTitle.Trim();
            app.Company = req.Company.Trim();
            app.Location = req.Location;
            app.JobLink = req.JobLink;
            app.JobDescription = req.JobDescription;
            app.Status = req.Status;
            app.AppliedDate = req.AppliedDate is { } d ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : null;
            app.Notes = req.Notes;
        }
    }
}
