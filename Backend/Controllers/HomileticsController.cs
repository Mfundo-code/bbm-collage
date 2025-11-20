using System;
using System.Collections.Generic;
using System.Linq;
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
    public class HomileticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HomileticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/homiletics - Get latest homiletics entries
        [HttpGet]
        public async Task<IActionResult> GetHomileticsEntries(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Only show entries that haven't expired yet
            var query = _context.HomileticsEntries
                .Include(h => h.Student)
                .ThenInclude(s => s.User)
                .Where(h => h.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(h => h.UploadedAt);

            var total = await query.CountAsync();
            var entries = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var entryDtos = entries.Select(e => MapToHomileticsEntryDto(e)).ToList();

            return Ok(new
            {
                items = entryDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/homiletics/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetHomileticsEntry(int id)
        {
            var entry = await _context.HomileticsEntries
                .Include(h => h.Student)
                .ThenInclude(s => s.User)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (entry == null)
                return NotFound();

            return Ok(MapToHomileticsEntryDto(entry));
        }

        // POST: api/homiletics - Upload new homiletics entry (admin only)
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateHomileticsEntry([FromBody] HomileticsEntryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate that student exists
            var student = await _context.Students.FindAsync(dto.StudentId);
            if (student == null)
                return BadRequest(new { message = "Student not found" });

            // Default expiration: Next Sunday at 11:59 PM
            var expiresAt = dto.ExpiresAt != default 
                ? dto.ExpiresAt 
                : GetNextSunday();

            var entry = new HomileticsEntry
            {
                StudentId = dto.StudentId,
                Title = dto.Title,
                SermonDoc = dto.SermonDoc,
                AudioFile = dto.AudioFile,
                AudioDuration = dto.AudioDuration,
                ExpiresAt = expiresAt
            };

            _context.HomileticsEntries.Add(entry);
            await _context.SaveChangesAsync();

            // Reload with relationships
            entry = await _context.HomileticsEntries
                .Include(h => h.Student)
                .ThenInclude(s => s.User)
                .FirstAsync(h => h.Id == entry.Id);

            return CreatedAtAction(nameof(GetHomileticsEntry), new { id = entry.Id }, MapToHomileticsEntryDto(entry));
        }

        // PUT: api/homiletics/{id} - Update entry (admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateHomileticsEntry(int id, [FromBody] HomileticsEntryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var entry = await _context.HomileticsEntries.FindAsync(id);
            if (entry == null)
                return NotFound();

            entry.Title = dto.Title;
            entry.SermonDoc = dto.SermonDoc;
            entry.AudioFile = dto.AudioFile;
            entry.AudioDuration = dto.AudioDuration;
            entry.ExpiresAt = dto.ExpiresAt;

            await _context.SaveChangesAsync();

            // Reload with relationships
            entry = await _context.HomileticsEntries
                .Include(h => h.Student)
                .ThenInclude(s => s.User)
                .FirstAsync(h => h.Id == entry.Id);

            return Ok(MapToHomileticsEntryDto(entry));
        }

        // DELETE: api/homiletics/{id} - Delete entry (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteHomileticsEntry(int id)
        {
            var entry = await _context.HomileticsEntries.FindAsync(id);
            if (entry == null)
                return NotFound();

            _context.HomileticsEntries.Remove(entry);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/homiletics/cleanup-expired - Delete expired entries (admin only, called by scheduled task)
        [HttpPost("cleanup-expired")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CleanupExpiredEntries()
        {
            var expiredEntries = await _context.HomileticsEntries
                .Where(h => h.ExpiresAt <= DateTime.UtcNow)
                .ToListAsync();

            if (expiredEntries.Any())
            {
                _context.HomileticsEntries.RemoveRange(expiredEntries);
                await _context.SaveChangesAsync();
            }

            return Ok(new 
            { 
                message = $"Cleaned up {expiredEntries.Count} expired homiletics entries",
                deletedCount = expiredEntries.Count
            });
        }

        private HomileticsEntryDto MapToHomileticsEntryDto(HomileticsEntry entry)
        {
            return new HomileticsEntryDto
            {
                Id = entry.Id,
                Student = new UserDto
                {
                    Id = entry.Student.User.Id,
                    Email = entry.Student.User.Email!,
                    FirstName = entry.Student.User.FirstName,
                    LastName = entry.Student.User.LastName,
                    Role = entry.Student.User.Role,
                    ProfilePhoto = entry.Student.User.ProfilePhoto,
                    ContactPhone = entry.Student.User.ContactPhone,
                    CreatedAt = entry.Student.User.CreatedAt
                },
                Title = entry.Title,
                SermonDoc = entry.SermonDoc,
                AudioFile = entry.AudioFile,
                AudioDuration = entry.AudioDuration,
                UploadedAt = entry.UploadedAt,
                ExpiresAt = entry.ExpiresAt
            };
        }

        private static DateTime GetNextSunday()
        {
            var now = DateTime.UtcNow;
            var daysUntilSunday = ((int)DayOfWeek.Sunday - (int)now.DayOfWeek + 7) % 7;
            
            if (daysUntilSunday == 0)
                daysUntilSunday = 7; // If today is Sunday, get next Sunday

            var nextSunday = now.AddDays(daysUntilSunday);
            return new DateTime(nextSunday.Year, nextSunday.Month, nextSunday.Day, 23, 59, 59, DateTimeKind.Utc);
        }
    }
}