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
    public class UpdatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UpdatesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/updates - Get all mission updates (day-to-day activities)
        [HttpGet]
        public async Task<IActionResult> GetUpdates(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Only show updates from last 7 days with videos/audio
            // Older posts remain but without media attachments
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var query = _context.Posts
                .Include(p => p.Author)
                .Where(p => p.PostType == "update")
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();
            var updates = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var updateDtos = updates.Select(u => MapToPostDto(u, sevenDaysAgo)).ToList();

            return Ok(new
            {
                items = updateDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/updates/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUpdate(int id)
        {
            var update = await _context.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == id && p.PostType == "update");

            if (update == null)
                return NotFound();

            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            return Ok(MapToPostDto(update, sevenDaysAgo));
        }

        // POST: api/updates - Create new update (admin only)
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateUpdate([FromBody] UpdateCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var update = new Post
            {
                AuthorId = userId!,
                Title = dto.Title,
                Body = dto.Body,
                PostType = "update",
                Attachments = JsonSerializer.Serialize(dto.Attachments),
                AllowComments = dto.AllowComments,
                AllowLikes = dto.AllowLikes,
                Pinned = false,
                Tags = JsonSerializer.Serialize(dto.Tags)
            };

            _context.Posts.Add(update);
            await _context.SaveChangesAsync();

            // Reload with author
            update = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == update.Id);

            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            return CreatedAtAction(nameof(GetUpdate), new { id = update.Id }, MapToPostDto(update, sevenDaysAgo));
        }

        // PUT: api/updates/{id} - Update existing update (admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateUpdate(int id, [FromBody] UpdateCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var update = await _context.Posts.FindAsync(id);
            if (update == null || update.PostType != "update")
                return NotFound();

            update.Title = dto.Title;
            update.Body = dto.Body;
            update.Attachments = JsonSerializer.Serialize(dto.Attachments);
            update.AllowComments = dto.AllowComments;
            update.AllowLikes = dto.AllowLikes;
            update.Tags = JsonSerializer.Serialize(dto.Tags);

            await _context.SaveChangesAsync();

            // Reload with author
            update = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == update.Id);

            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            return Ok(MapToPostDto(update, sevenDaysAgo));
        }

        // DELETE: api/updates/{id} - Delete update (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteUpdate(int id)
        {
            var update = await _context.Posts.FindAsync(id);
            if (update == null || update.PostType != "update")
                return NotFound();

            _context.Posts.Remove(update);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/updates/cleanup-media - Remove videos/audio from updates older than 7 days
        [HttpPost("cleanup-media")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CleanupOldMedia()
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var oldUpdates = await _context.Posts
                .Where(p => p.PostType == "update" && p.CreatedAt < sevenDaysAgo)
                .ToListAsync();

            int cleanedCount = 0;

            foreach (var update in oldUpdates)
            {
                var attachments = JsonSerializer.Deserialize<List<string>>(update.Attachments) ?? new List<string>();
                
                // Filter out video and audio files
                var filteredAttachments = attachments
                    .Where(a => !IsVideoOrAudio(a))
                    .ToList();

                if (filteredAttachments.Count != attachments.Count)
                {
                    update.Attachments = JsonSerializer.Serialize(filteredAttachments);
                    cleanedCount++;
                }
            }

            if (cleanedCount > 0)
            {
                await _context.SaveChangesAsync();
            }

            return Ok(new 
            { 
                message = $"Cleaned up media from {cleanedCount} updates older than 7 days",
                cleanedCount = cleanedCount
            });
        }

        private PostDto MapToPostDto(Post post, DateTime sevenDaysAgo)
        {
            var likeCount = _context.Likes
                .Count(l => l.ParentType == "post" && l.ParentId == post.Id);

            var commentCount = _context.Comments
                .Count(c => c.ParentType == "post" && c.ParentId == post.Id);

            var attachments = JsonSerializer.Deserialize<List<string>>(post.Attachments) ?? new List<string>();

            // If post is older than 7 days, filter out videos and audio
            if (post.CreatedAt < sevenDaysAgo)
            {
                attachments = attachments.Where(a => !IsVideoOrAudio(a)).ToList();
            }

            return new PostDto
            {
                Id = post.Id,
                Author = MapToUserDto(post.Author),
                Title = post.Title,
                Body = post.Body,
                PostType = post.PostType,
                Attachments = attachments,
                AllowComments = post.AllowComments,
                AllowLikes = post.AllowLikes,
                Pinned = post.Pinned,
                Tags = JsonSerializer.Deserialize<List<string>>(post.Tags) ?? new List<string>(),
                CreatedAt = post.CreatedAt,
                ScheduledAt = post.ScheduledAt,
                LikeCount = likeCount,
                CommentCount = commentCount
            };
        }

        private static bool IsVideoOrAudio(string url)
        {
            var lowerUrl = url.ToLower();
            var videoAudioExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", 
                                               ".mp3", ".wav", ".ogg", ".m4a", ".aac" };
            
            return videoAudioExtensions.Any(ext => lowerUrl.EndsWith(ext)) ||
                   lowerUrl.Contains("video") ||
                   lowerUrl.Contains("audio");
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

    public class UpdateCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string> Attachments { get; set; } = new(); // Videos, images, descriptions
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public List<string> Tags { get; set; } = new(); // e.g., "ministry", "outreach", "events"
    }
}