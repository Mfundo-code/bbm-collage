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
    public class AlumniController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AlumniController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/alumni - Get all alumni
        [HttpGet]
        public async Task<IActionResult> GetAlumni(
            [FromQuery] int? graduationYear = null,
            [FromQuery] string? currentLocation = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Alumnis
                .Include(a => a.User)
                .AsQueryable();

            if (graduationYear.HasValue)
                query = query.Where(a => a.GraduationYear == graduationYear.Value);

            if (!string.IsNullOrEmpty(currentLocation))
                query = query.Where(a => a.CurrentLocation != null && a.CurrentLocation.Contains(currentLocation));

            // Order by graduation year (most recent first)
            query = query.OrderByDescending(a => a.GraduationYear)
                         .ThenBy(a => a.User.FirstName);

            var total = await query.CountAsync();
            var alumni = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var alumniDtos = alumni.Select(a => MapToAlumniDto(a)).ToList();

            return Ok(new
            {
                items = alumniDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/alumni/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetAlumnus(string userId)
        {
            var alumnus = await _context.Alumnis
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.UserId == userId);

            if (alumnus == null)
                return NotFound();

            return Ok(MapToAlumniDto(alumnus));
        }

        // GET: api/alumni/years - Get unique graduation years
        [HttpGet("years")]
        public async Task<IActionResult> GetGraduationYears()
        {
            var years = await _context.Alumnis
                .Select(a => a.GraduationYear)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();

            return Ok(years);
        }

        // GET: api/alumni/locations - Get unique locations
        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _context.Alumnis
                .Where(a => a.CurrentLocation != null)
                .Select(a => a.CurrentLocation)
                .Distinct()
                .OrderBy(l => l)
                .ToListAsync();

            return Ok(locations);
        }

        // PUT: api/alumni/{userId} - Update alumni profile (owner or admin)
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateAlumniProfile(string userId, [FromBody] AlumniUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var alumnus = await _context.Alumnis.FindAsync(userId);
            if (alumnus == null)
                return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only owner or admin can update
            if (userId != currentUserId && userRole != "admin")
                return Forbid();

            alumnus.CurrentLocation = dto.CurrentLocation;
            alumnus.Bio = dto.Bio;
            alumnus.Skills = JsonSerializer.Serialize(dto.Skills);
            alumnus.PublicContact = JsonSerializer.Serialize(dto.PublicContact);
            alumnus.LinkedProfiles = JsonSerializer.Serialize(dto.LinkedProfiles);

            await _context.SaveChangesAsync();

            // Reload with user
            alumnus = await _context.Alumnis
                .Include(a => a.User)
                .FirstAsync(a => a.UserId == userId);

            return Ok(MapToAlumniDto(alumnus));
        }

        // POST: api/alumni/{userId}/follow
        [HttpPost("{userId}/follow")]
        public async Task<IActionResult> FollowAlumnus(string userId)
        {
            var alumnus = await _context.Alumnis.FindAsync(userId);
            if (alumnus == null)
                return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Check if already following
            var existingFollow = await _context.Likes
                .FirstOrDefaultAsync(l => 
                    l.UserId == currentUserId && 
                    l.ParentType == "alumni" && 
                    l.ParentId.ToString() == userId);

            if (existingFollow != null)
                return Ok(new { following = true, message = "Already following" });

            // Create follow (using Likes table)
            var follow = new Like
            {
                UserId = currentUserId!,
                ParentType = "alumni",
                ParentId = int.Parse(userId.GetHashCode().ToString()) // Hash the userId to create an int
            };

            _context.Likes.Add(follow);
            await _context.SaveChangesAsync();

            return Ok(new { following = true, message = "Now following alumni" });
        }

        // DELETE: api/alumni/{userId}/follow
        [HttpDelete("{userId}/follow")]
        public async Task<IActionResult> UnfollowAlumnus(string userId)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var follow = await _context.Likes
                .FirstOrDefaultAsync(l => 
                    l.UserId == currentUserId && 
                    l.ParentType == "alumni" && 
                    l.ParentId.ToString() == userId);

            if (follow == null)
                return Ok(new { following = false, message = "Not following" });

            _context.Likes.Remove(follow);
            await _context.SaveChangesAsync();

            return Ok(new { following = false, message = "Unfollowed alumni" });
        }

        private AlumniDto MapToAlumniDto(Alumni alumni)
        {
            return new AlumniDto
            {
                User = MapToUserDto(alumni.User),
                GraduationYear = alumni.GraduationYear,
                CurrentLocation = alumni.CurrentLocation,
                Bio = alumni.Bio,
                Skills = JsonSerializer.Deserialize<List<string>>(alumni.Skills) ?? new List<string>(),
                PublicContact = JsonSerializer.Deserialize<Dictionary<string, string>>(alumni.PublicContact) ?? new Dictionary<string, string>(),
                LinkedProfiles = JsonSerializer.Deserialize<Dictionary<string, string>>(alumni.LinkedProfiles) ?? new Dictionary<string, string>()
            };
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role,
                ProfilePhoto = user.ProfilePhoto,
                ContactPhone = user.ContactPhone,
                CreatedAt = user.CreatedAt
            };
        }
    }

    public class AlumniUpdateDto
    {
        public string? CurrentLocation { get; set; }
        public string? Bio { get; set; }
        public List<string> Skills { get; set; } = new();
        public Dictionary<string, string> PublicContact { get; set; } = new();
        public Dictionary<string, string> LinkedProfiles { get; set; } = new();
    }
}