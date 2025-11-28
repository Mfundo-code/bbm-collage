using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OutreachesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OutreachesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/outreaches
        [HttpGet]
        public async Task<IActionResult> GetOutreaches([FromQuery] string? status = null)
        {
            var query = _context.Outreaches
                .Include(o => o.Reports)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            query = query.OrderByDescending(o => o.CreatedAt);

            var outreaches = await query.ToListAsync();
            var outreachDtos = outreaches.Select(o => MapToOutreachDto(o)).ToList();

            return Ok(outreachDtos);
        }

        // GET: api/outreaches/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOutreach(int id)
        {
            var outreach = await _context.Outreaches
                .Include(o => o.Reports)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (outreach == null)
                return NotFound();

            return Ok(MapToOutreachDto(outreach));
        }

        // POST: api/outreaches
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateOutreach([FromBody] OutreachCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var outreach = new Outreach
            {
                Title = dto.Title,
                Status = dto.Status,
                Location = dto.Location,
                Leader = dto.Leader,
                Activities = JsonSerializer.Serialize(dto.Activities),
                Description = dto.Description,
                Photos = JsonSerializer.Serialize(dto.Photos)
            };

            _context.Outreaches.Add(outreach);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOutreach), new { id = outreach.Id }, MapToOutreachDto(outreach));
        }

        // PUT: api/outreaches/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateOutreach(int id, [FromBody] OutreachCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var outreach = await _context.Outreaches.FindAsync(id);
            if (outreach == null)
                return NotFound();

            outreach.Title = dto.Title;
            outreach.Status = dto.Status;
            outreach.Location = dto.Location;
            outreach.Leader = dto.Leader;
            outreach.Activities = JsonSerializer.Serialize(dto.Activities);
            outreach.Description = dto.Description;
            outreach.Photos = JsonSerializer.Serialize(dto.Photos);
            outreach.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload with reports
            outreach = await _context.Outreaches
                .Include(o => o.Reports)
                .FirstAsync(o => o.Id == outreach.Id);

            return Ok(MapToOutreachDto(outreach));
        }

        // DELETE: api/outreaches/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteOutreach(int id)
        {
            var outreach = await _context.Outreaches.FindAsync(id);
            if (outreach == null)
                return NotFound();

            _context.Outreaches.Remove(outreach);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/outreaches/{id}/reports
        [HttpPost("{id}/reports")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateOutreachReport(int id, [FromBody] OutreachReportCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var outreach = await _context.Outreaches.FindAsync(id);
            if (outreach == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(userId);
            var authorName = user?.FirstName != null ? $"{user.FirstName} {user.LastName}" : "Admin";

            var report = new OutreachReport
            {
                OutreachId = id,
                Title = dto.Title,
                Author = authorName,
                Description = dto.Description,
                Photos = JsonSerializer.Serialize(dto.Photos)
            };

            _context.OutreachReports.Add(report);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOutreach), new { id = outreach.Id }, MapToOutreachReportDto(report));
        }

        // GET: api/outreaches/{id}/reports
        [HttpGet("{id}/reports")]
        public async Task<IActionResult> GetOutreachReports(int id)
        {
            var reports = await _context.OutreachReports
                .Where(r => r.OutreachId == id)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var reportDtos = reports.Select(r => MapToOutreachReportDto(r)).ToList();

            return Ok(reportDtos);
        }

        // DELETE: api/outreaches/reports/{reportId}
        [HttpDelete("reports/{reportId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteOutreachReport(int reportId)
        {
            var report = await _context.OutreachReports.FindAsync(reportId);
            if (report == null)
                return NotFound();

            _context.OutreachReports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private OutreachDto MapToOutreachDto(Outreach outreach)
        {
            return new OutreachDto
            {
                Id = outreach.Id,
                Title = outreach.Title,
                Status = outreach.Status,
                Location = outreach.Location,
                Leader = outreach.Leader,
                Activities = JsonSerializer.Deserialize<List<string>>(outreach.Activities) ?? new List<string>(),
                Description = outreach.Description,
                Photos = JsonSerializer.Deserialize<List<string>>(outreach.Photos) ?? new List<string>(),
                CreatedAt = outreach.CreatedAt,
                Reports = outreach.Reports
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => MapToOutreachReportDto(r))
                    .ToList()
            };
        }

        private OutreachReportDto MapToOutreachReportDto(OutreachReport report)
        {
            return new OutreachReportDto
            {
                Id = report.Id,
                OutreachId = report.OutreachId,
                Title = report.Title,
                Author = report.Author,
                Description = report.Description,
                Photos = JsonSerializer.Deserialize<List<string>>(report.Photos) ?? new List<string>(),
                CreatedAt = report.CreatedAt
            };
        }
    }
}