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
    public class PrayerWallController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PrayerWallController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/prayerwall
        [HttpGet]
        public async Task<IActionResult> GetPrayerWall(
            [FromQuery] string? urgency = null,
            [FromQuery] string? status = null,
            [FromQuery] string? missionaryId = null,
            [FromQuery] bool? myRequests = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.PrayerRequests
                .Include(pr => pr.Missionary)
                    .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .AsQueryable();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Apply filters
            if (!string.IsNullOrEmpty(urgency))
                query = query.Where(pr => pr.Urgency == urgency);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(pr => pr.Status == status);

            if (!string.IsNullOrEmpty(missionaryId))
                query = query.Where(pr => pr.MissionaryId == missionaryId);

            if (myRequests == true && !string.IsNullOrEmpty(userId))
                query = query.Where(pr => pr.PostedById == userId);

            // Order by urgency (high first), then by creation date
            query = query.OrderByDescending(pr => pr.Urgency == "high")
                        .ThenByDescending(pr => pr.Urgency == "medium")
                        .ThenByDescending(pr => pr.CreatedAt);

            var total = await query.CountAsync();
            var requests = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var requestDtos = requests.Select(pr => MapToPrayerWallDto(pr)).ToList();

            return Ok(new
            {
                items = requestDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/prayerwall/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPrayerRequest(int id)
        {
            var prayerRequest = await _context.PrayerRequests
                .Include(pr => pr.Missionary)
                    .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .FirstOrDefaultAsync(pr => pr.Id == id);

            if (prayerRequest == null)
                return NotFound();

            return Ok(MapToPrayerWallDto(prayerRequest));
        }

        // POST: api/prayerwall
        [HttpPost]
        public async Task<IActionResult> CreatePrayerRequest([FromBody] PrayerWallCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Validate missionary if provided
            if (!string.IsNullOrEmpty(dto.MissionaryId))
            {
                var missionaryExists = await _context.Missionaries
                    .AnyAsync(m => m.UserId == dto.MissionaryId);
                
                if (!missionaryExists)
                    return BadRequest("Invalid MissionaryId.");
            }

            var prayerRequest = new PrayerRequest
            {
                Text = dto.Text,
                Urgency = dto.Urgency ?? "medium",
                Images = JsonSerializer.Serialize(dto.Images ?? new List<string>()),
                PostedById = userId,
                PrayerCount = 0,
                MissionaryId = string.IsNullOrEmpty(dto.MissionaryId) ? null : dto.MissionaryId,
                Status = "active",
                CreatedAt = DateTime.UtcNow
            };

            _context.PrayerRequests.Add(prayerRequest);
            await _context.SaveChangesAsync();

            // Reload with relationships
            prayerRequest = await _context.PrayerRequests
                .Include(pr => pr.Missionary)
                    .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .FirstAsync(pr => pr.Id == prayerRequest.Id);

            return CreatedAtAction(nameof(GetPrayerRequest), 
                new { id = prayerRequest.Id }, 
                MapToPrayerWallDto(prayerRequest));
        }

        // POST: api/prayerwall/{id}/pray
        [HttpPost("{id}/pray")]
        public async Task<IActionResult> PrayForRequest(int id)
        {
            var prayerRequest = await _context.PrayerRequests.FindAsync(id);
            if (prayerRequest == null)
                return NotFound();

            prayerRequest.PrayerCount++;
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                prayerCount = prayerRequest.PrayerCount, 
                message = "Prayer recorded" 
            });
        }

        // PUT: api/prayerwall/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePrayerRequest(int id, [FromBody] PrayerWallUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var prayerRequest = await _context.PrayerRequests.FindAsync(id);
            if (prayerRequest == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only owner or admin can update
            if (prayerRequest.PostedById != userId && userRole != "admin")
                return Forbid();

            // Update fields
            prayerRequest.Text = dto.Text ?? prayerRequest.Text;
            prayerRequest.Urgency = dto.Urgency ?? prayerRequest.Urgency;
            
            if (dto.Images != null)
                prayerRequest.Images = JsonSerializer.Serialize(dto.Images);
            
            if (!string.IsNullOrEmpty(dto.Status))
            {
                prayerRequest.Status = dto.Status;
                if (dto.Status == "answered")
                    prayerRequest.AnsweredAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Reload with relationships
            prayerRequest = await _context.PrayerRequests
                .Include(pr => pr.Missionary)
                    .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .FirstAsync(pr => pr.Id == prayerRequest.Id);

            return Ok(MapToPrayerWallDto(prayerRequest));
        }

        // PATCH: api/prayerwall/{id}/mark-answered
        [HttpPatch("{id}/mark-answered")]
        public async Task<IActionResult> MarkAsAnswered(int id)
        {
            var prayerRequest = await _context.PrayerRequests.FindAsync(id);
            if (prayerRequest == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only owner or admin can mark as answered
            if (prayerRequest.PostedById != userId && userRole != "admin")
                return Forbid();

            prayerRequest.Status = "answered";
            prayerRequest.AnsweredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Prayer request marked as answered" });
        }

        // DELETE: api/prayerwall/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePrayerRequest(int id)
        {
            var prayerRequest = await _context.PrayerRequests.FindAsync(id);
            if (prayerRequest == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only owner or admin can delete
            if (prayerRequest.PostedById != userId && userRole != "admin")
                return Forbid();

            _context.PrayerRequests.Remove(prayerRequest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/prayerwall/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalRequests = await _context.PrayerRequests.CountAsync();
            var totalPrayers = await _context.PrayerRequests.SumAsync(pr => pr.PrayerCount);
            var answeredRequests = await _context.PrayerRequests
                .CountAsync(pr => pr.Status == "answered");
            var urgentRequests = await _context.PrayerRequests
                .CountAsync(pr => pr.Urgency == "high");
            var recentRequests = await _context.PrayerRequests
                .CountAsync(pr => pr.CreatedAt >= DateTime.UtcNow.AddDays(-7));

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userPrayers = await _context.PrayerRequests
                .Where(pr => pr.PostedById == userId)
                .CountAsync();
            
            var userAnsweredPrayers = await _context.PrayerRequests
                .Where(pr => pr.PostedById == userId && pr.Status == "answered")
                .CountAsync();

            return Ok(new
            {
                totalRequests,
                totalPrayers,
                answeredRequests,
                urgentRequests,
                recentRequests,
                userPrayers,
                userAnsweredPrayers
            });
        }

        // GET: api/prayerwall/my-requests
        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyPrayerRequests(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var query = _context.PrayerRequests
                .Include(pr => pr.Missionary)
                    .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .Where(pr => pr.PostedById == userId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(pr => pr.Status == status);

            query = query.OrderByDescending(pr => pr.CreatedAt);

            var total = await query.CountAsync();
            var myRequests = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var requestDtos = myRequests.Select(pr => MapToPrayerWallDto(pr)).ToList();

            return Ok(new
            {
                items = requestDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        private PrayerWallDto MapToPrayerWallDto(PrayerRequest pr)
        {
            return new PrayerWallDto
            {
                Id = pr.Id,
                Missionary = pr.Missionary == null ? null : new MissionaryDto
                {
                    User = new UserDto
                    {
                        Id = pr.Missionary.User.Id,
                        Email = pr.Missionary.User.Email!,
                        FirstName = pr.Missionary.User.FirstName,
                        LastName = pr.Missionary.User.LastName,
                        Role = pr.Missionary.User.Role,
                        ProfilePhoto = pr.Missionary.User.ProfilePhoto,
                        ContactPhone = pr.Missionary.User.ContactPhone,
                        CreatedAt = pr.Missionary.User.CreatedAt
                    },
                    Photo = pr.Missionary.Photo,
                    LocationCountry = pr.Missionary.LocationCountry,
                    OriginalCountry = pr.Missionary.OriginalCountry,
                    SendingOrganization = pr.Missionary.SendingOrganization,
                    Bio = pr.Missionary.Bio,
                    MinistryDescription = pr.Missionary.MinistryDescription,
                    ContactPreference = pr.Missionary.ContactPreference,
                    ActiveStatus = pr.Missionary.ActiveStatus,
                    LatestUpdate = null
                },
                Text = pr.Text,
                Urgency = pr.Urgency,
                Status = pr.Status,
                Images = JsonSerializer.Deserialize<List<string>>(pr.Images) ?? new List<string>(),
                PostedBy = new UserDto
                {
                    Id = pr.PostedBy.Id,
                    Email = pr.PostedBy.Email!,
                    FirstName = pr.PostedBy.FirstName,
                    LastName = pr.PostedBy.LastName,
                    Role = pr.PostedBy.Role,
                    ProfilePhoto = pr.PostedBy.ProfilePhoto,
                    ContactPhone = pr.PostedBy.ContactPhone,
                    CreatedAt = pr.PostedBy.CreatedAt
                },
                CreatedAt = pr.CreatedAt,
                PrayerCount = pr.PrayerCount
            };
        }
    }
}