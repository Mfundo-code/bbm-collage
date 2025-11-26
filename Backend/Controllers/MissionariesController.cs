using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MissionariesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public MissionariesController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/missionaries - Get all missionaries
        [HttpGet]
        public async Task<IActionResult> GetMissionaries(
            [FromQuery] string? activeStatus = null,
            [FromQuery] string? locationCountry = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Missionaries
                .Include(m => m.User)
                .Include(m => m.LatestUpdate)
                .ThenInclude(p => p!.Author)
                .AsQueryable();

            if (!string.IsNullOrEmpty(activeStatus))
                query = query.Where(m => m.ActiveStatus == activeStatus);

            if (!string.IsNullOrEmpty(locationCountry))
                query = query.Where(m => m.LocationCountry == locationCountry);

            query = query.OrderBy(m => m.User.FirstName);

            var total = await query.CountAsync();
            var missionaries = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var missionaryDtos = missionaries.Select(m => MapToMissionaryDto(m)).ToList();

            return Ok(new
            {
                items = missionaryDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/missionaries/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetMissionary(string userId)
        {
            var missionary = await _context.Missionaries
                .Include(m => m.User)
                .Include(m => m.LatestUpdate)
                .ThenInclude(p => p!.Author)
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (missionary == null)
                return NotFound();

            return Ok(MapToMissionaryDto(missionary));
        }

        // POST: api/missionaries - Create new missionary (admin only)
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateMissionary([FromBody] MissionaryCreateDto dto)
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
                Role = "missionary",
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

            // Create missionary profile
            var missionary = new Missionary
            {
                UserId = user.Id,
                Photo = dto.ProfilePhoto,
                LocationCountry = dto.MissionCountry,
                SendingOrganization = dto.Organization,
                Bio = dto.Bio,
                MinistryDescription = dto.MinistryDescription,
                ContactPreference = dto.ContactPreference,
                ActiveStatus = "active",
                OriginalCountry = dto.OriginalCountry
            };

            _context.Missionaries.Add(missionary);
            await _context.SaveChangesAsync();

            // Reload with relationships
            missionary = await _context.Missionaries
                .Include(m => m.User)
                .FirstAsync(m => m.UserId == user.Id);

            return Ok(new
            {
                message = "Missionary created successfully",
                missionary = MapToMissionaryDto(missionary),
                credentials = new
                {
                    email = user.Email,
                    temporaryPassword = password
                }
            });
        }

        // PUT: api/missionaries/{userId} - Update missionary profile
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateMissionary(string userId, [FromBody] MissionaryUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var missionary = await _context.Missionaries
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (missionary == null)
                return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only owner or admin can update
            if (userId != currentUserId && userRole != "admin" && userRole != "secretary")
                return Forbid();

            // Update user info
            missionary.User.FirstName = dto.FirstName ?? missionary.User.FirstName;
            missionary.User.LastName = dto.LastName ?? missionary.User.LastName;
            missionary.User.ContactPhone = dto.ContactPhone ?? missionary.User.ContactPhone;
            missionary.User.ProfilePhoto = dto.ProfilePhoto ?? missionary.User.ProfilePhoto;

            // Update missionary profile
            missionary.Photo = dto.ProfilePhoto ?? missionary.Photo;
            missionary.LocationCountry = dto.MissionCountry ?? missionary.LocationCountry;
            missionary.SendingOrganization = dto.Organization ?? missionary.SendingOrganization;
            missionary.Bio = dto.Bio ?? missionary.Bio;
            missionary.MinistryDescription = dto.MinistryDescription ?? missionary.MinistryDescription;
            missionary.ContactPreference = dto.ContactPreference ?? missionary.ContactPreference;
            missionary.OriginalCountry = dto.OriginalCountry ?? missionary.OriginalCountry;

            if (userRole == "admin" || userRole == "secretary")
            {
                missionary.ActiveStatus = dto.ActiveStatus ?? missionary.ActiveStatus;
            }

            await _context.SaveChangesAsync();

            // Reload with relationships
            missionary = await _context.Missionaries
                .Include(m => m.User)
                .Include(m => m.LatestUpdate)
                .ThenInclude(p => p!.Author)
                .FirstAsync(m => m.UserId == userId);

            return Ok(MapToMissionaryDto(missionary));
        }

        // DELETE: api/missionaries/{userId} - Delete missionary (admin only)
        [HttpDelete("{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteMissionary(string userId)
        {
            var missionary = await _context.Missionaries
                .Include(m => m.User)
                .FirstOrDefaultAsync(m => m.UserId == userId);

            if (missionary == null)
                return NotFound();

            var user = missionary.User;

            _context.Missionaries.Remove(missionary);
            await _userManager.DeleteAsync(user);

            return NoContent();
        }

        // GET: api/missionaries/{userId}/prayer-requests
        [HttpGet("{userId}/prayer-requests")]
        public async Task<IActionResult> GetMissionaryPrayerRequests(
            string userId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.PrayerRequests
                .Include(pr => pr.Missionary)
                .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .Where(pr => pr.MissionaryId == userId)
                .OrderByDescending(pr => pr.CreatedAt);

            var total = await query.CountAsync();
            var prayerRequests = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var prayerRequestDtos = prayerRequests.Select(pr => MapToPrayerRequestDto(pr)).ToList();

            return Ok(new
            {
                items = prayerRequestDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // POST: api/missionaries/{userId}/prayer-requests
        [HttpPost("{userId}/prayer-requests")]
        public async Task<IActionResult> CreatePrayerRequest(string userId, [FromBody] PrayerRequestCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var missionary = await _context.Missionaries.FindAsync(userId);
            if (missionary == null)
                return NotFound(new { message = "Missionary not found" });

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var prayerRequest = new PrayerRequest
            {
                MissionaryId = userId,
                Text = dto.Text,
                Urgency = dto.Urgency,
                Images = JsonSerializer.Serialize(dto.Images),
                PostedById = currentUserId!,
                PrayerCount = 0
            };

            _context.PrayerRequests.Add(prayerRequest);
            await _context.SaveChangesAsync();

            // Reload with relationships
            prayerRequest = await _context.PrayerRequests
                .Include(pr => pr.Missionary)
                .ThenInclude(m => m.User)
                .Include(pr => pr.PostedBy)
                .FirstAsync(pr => pr.Id == prayerRequest.Id);

            return CreatedAtAction(nameof(GetMissionaryPrayerRequests), 
                new { userId = userId }, 
                MapToPrayerRequestDto(prayerRequest));
        }

        // POST: api/missionaries/prayer-requests/{id}/pray
        [HttpPost("prayer-requests/{id}/pray")]
        public async Task<IActionResult> PrayForRequest(int id)
        {
            var prayerRequest = await _context.PrayerRequests.FindAsync(id);
            if (prayerRequest == null)
                return NotFound();

            prayerRequest.PrayerCount++;
            await _context.SaveChangesAsync();

            return Ok(new { prayerCount = prayerRequest.PrayerCount, message = "Prayer recorded" });
        }

        // POST: api/missionaries/{userId}/follow
        [HttpPost("{userId}/follow")]
        public async Task<IActionResult> FollowMissionary(string userId)
        {
            var missionary = await _context.Missionaries.FindAsync(userId);
            if (missionary == null)
                return NotFound();

            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Check if already following
            var existingFollow = await _context.Likes
                .FirstOrDefaultAsync(l => 
                    l.UserId == currentUserId && 
                    l.ParentType == "missionary" && 
                    l.ParentId.ToString() == userId);

            if (existingFollow != null)
                return Ok(new { following = true, message = "Already following" });

            // Create follow
            var follow = new Like
            {
                UserId = currentUserId!,
                ParentType = "missionary",
                ParentId = userId.GetHashCode()
            };

            _context.Likes.Add(follow);
            await _context.SaveChangesAsync();

            return Ok(new { following = true, message = "Now following missionary" });
        }

        // DELETE: api/missionaries/{userId}/follow
        [HttpDelete("{userId}/follow")]
        public async Task<IActionResult> UnfollowMissionary(string userId)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var follow = await _context.Likes
                .FirstOrDefaultAsync(l => 
                    l.UserId == currentUserId && 
                    l.ParentType == "missionary" && 
                    l.ParentId.ToString() == userId);

            if (follow == null)
                return Ok(new { following = false, message = "Not following" });

            _context.Likes.Remove(follow);
            await _context.SaveChangesAsync();

            return Ok(new { following = false, message = "Unfollowed missionary" });
        }

        private MissionaryDto MapToMissionaryDto(Missionary missionary)
        {
            return new MissionaryDto
            {
                User = MapToUserDto(missionary.User),
                Photo = missionary.Photo,
                LocationCountry = missionary.LocationCountry,
                OriginalCountry = missionary.OriginalCountry,
                SendingOrganization = missionary.SendingOrganization,
                Bio = missionary.Bio,
                MinistryDescription = missionary.MinistryDescription,
                ContactPreference = missionary.ContactPreference,
                ActiveStatus = missionary.ActiveStatus,
                LatestUpdate = missionary.LatestUpdate == null ? null : MapToPostDto(missionary.LatestUpdate)
            };
        }

        private PrayerRequestDto MapToPrayerRequestDto(PrayerRequest pr)
        {
            return new PrayerRequestDto
            {
                Id = pr.Id,
                Missionary = MapToMissionaryDto(pr.Missionary),
                Text = pr.Text,
                Urgency = pr.Urgency,
                Images = JsonSerializer.Deserialize<List<string>>(pr.Images) ?? new List<string>(),
                PostedBy = MapToUserDto(pr.PostedBy),
                CreatedAt = pr.CreatedAt,
                PrayerCount = pr.PrayerCount
            };
        }

        private PostDto MapToPostDto(Post post)
        {
            return new PostDto
            {
                Id = post.Id,
                Author = MapToUserDto(post.Author),
                Title = post.Title,
                Body = post.Body,
                PostType = post.PostType,
                Attachments = JsonSerializer.Deserialize<List<string>>(post.Attachments) ?? new List<string>(),
                AllowComments = post.AllowComments,
                AllowLikes = post.AllowLikes,
                Pinned = post.Pinned,
                Tags = JsonSerializer.Deserialize<List<string>>(post.Tags) ?? new List<string>(),
                CreatedAt = post.CreatedAt,
                ScheduledAt = post.ScheduledAt
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