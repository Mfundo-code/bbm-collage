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
    public class AnnouncementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/announcements - Get all announcements (latest first)
        [HttpGet]
        public async Task<IActionResult> GetAnnouncements(
            [FromQuery] bool? pinned = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Posts
                .Include(p => p.Author)
                .Where(p => p.PostType == "announcement")
                .AsQueryable();

            if (pinned.HasValue)
                query = query.Where(p => p.Pinned == pinned.Value);

            // Pinned first, then by creation date
            query = query.OrderByDescending(p => p.Pinned)
                         .ThenByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();
            var announcements = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var announcementDtos = announcements.Select(a => MapToPostDto(a)).ToList();

            return Ok(new
            {
                items = announcementDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/announcements/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAnnouncement(int id)
        {
            var announcement = await _context.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == id && p.PostType == "announcement");

            if (announcement == null)
                return NotFound();

            return Ok(MapToPostDto(announcement));
        }

        // POST: api/announcements - Create announcement (admin only)
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateAnnouncement([FromBody] AnnouncementCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var announcement = new Post
            {
                AuthorId = userId!,
                Title = dto.Title,
                Body = dto.Body,
                PostType = "announcement",
                Attachments = JsonSerializer.Serialize(dto.Attachments),
                AllowComments = dto.AllowComments,
                AllowLikes = dto.AllowLikes,
                Pinned = dto.Pinned,
                Tags = JsonSerializer.Serialize(dto.Tags),
                ScheduledAt = dto.ScheduledAt
            };

            _context.Posts.Add(announcement);
            await _context.SaveChangesAsync();

            // Reload with author
            announcement = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == announcement.Id);

            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, MapToPostDto(announcement));
        }

        // PUT: api/announcements/{id} - Update announcement (admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateAnnouncement(int id, [FromBody] AnnouncementCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var announcement = await _context.Posts.FindAsync(id);
            if (announcement == null || announcement.PostType != "announcement")
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only author or admin can update
            if (announcement.AuthorId != userId && userRole != "admin")
                return Forbid();

            announcement.Title = dto.Title;
            announcement.Body = dto.Body;
            announcement.Attachments = JsonSerializer.Serialize(dto.Attachments);
            announcement.AllowComments = dto.AllowComments;
            announcement.AllowLikes = dto.AllowLikes;
            announcement.Pinned = dto.Pinned;
            announcement.Tags = JsonSerializer.Serialize(dto.Tags);
            announcement.ScheduledAt = dto.ScheduledAt;

            await _context.SaveChangesAsync();

            // Reload with author
            announcement = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == announcement.Id);

            return Ok(MapToPostDto(announcement));
        }

        // DELETE: api/announcements/{id} - Delete announcement (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            var announcement = await _context.Posts.FindAsync(id);
            if (announcement == null || announcement.PostType != "announcement")
                return NotFound();

            _context.Posts.Remove(announcement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private PostDto MapToPostDto(Post post)
        {
            var likeCount = _context.Likes
                .Count(l => l.ParentType == "post" && l.ParentId == post.Id);

            var commentCount = _context.Comments
                .Count(c => c.ParentType == "post" && c.ParentId == post.Id);

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
                ScheduledAt = post.ScheduledAt,
                LikeCount = likeCount,
                CommentCount = commentCount
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

    public class AnnouncementCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string> Attachments { get; set; } = new();
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public bool Pinned { get; set; } = false;
        public List<string> Tags { get; set; } = new();
        public DateTime? ScheduledAt { get; set; }
    }
}