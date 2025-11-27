using Backend.Models;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlumniController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;

        public AlumniController(UserManager<User> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
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

        // POST: api/alumni - Create new alumni (admin only)
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateAlumni([FromBody] AlumniCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest(new { message = "User with this email already exists" });

            // Generate random password
            var password = GenerateRandomPassword();

            // Create user
            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Role = "alumni",
                ContactPhone = dto.ContactPhone,
                ProfilePhoto = dto.ProfilePhoto,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Failed to create user",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            // Create alumni profile
            var alumni = new Alumni
            {
                UserId = user.Id,
                GraduationYear = dto.GraduationYear,
                CurrentLocation = dto.CurrentLocation,
                Bio = dto.Bio,
                Skills = JsonSerializer.Serialize(dto.Skills),
                PublicContact = JsonSerializer.Serialize(dto.PublicContact),
                LinkedProfiles = JsonSerializer.Serialize(dto.LinkedProfiles)
            };

            _context.Alumnis.Add(alumni);
            await _context.SaveChangesAsync();

            // Reload with relationships
            alumni = await _context.Alumnis
                .Include(a => a.User)
                .FirstAsync(a => a.UserId == user.Id);

            return Ok(new
            {
                message = "Alumni created successfully",
                alumni = MapToAlumniDto(alumni),
                credentials = new
                {
                    email = user.Email,
                    temporaryPassword = password
                }
            });
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

        // DELETE: api/alumni/{userId} - Delete alumni (admin only)
        [HttpDelete("{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteAlumni(string userId)
        {
            var alumni = await _context.Alumnis
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.UserId == userId);

            if (alumni == null)
                return NotFound();

            var user = alumni.User;

            _context.Alumnis.Remove(alumni);
            await _context.SaveChangesAsync();
            
            // Also delete the user account
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Failed to delete user account",
                    errors = result.Errors.Select(e => e.Description)
                });
            }

            return NoContent();
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

        private static string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}