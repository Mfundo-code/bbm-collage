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
    public class SundayServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SundayServicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/sundayservices - Get all Sunday service posts
        [HttpGet]
        public async Task<IActionResult> GetSundayServices(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            // Only show posts that haven't expired (within 7 days)
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var query = _context.Posts
                .Include(p => p.Author)
                .Where(p => p.PostType == "sunday_service" && p.CreatedAt >= sevenDaysAgo)
                .OrderByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();
            var services = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var serviceDtos = services.Select(s => MapToPostDto(s)).ToList();

            return Ok(new
            {
                items = serviceDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/sundayservices/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSundayService(int id)
        {
            var service = await _context.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == id && p.PostType == "sunday_service");

            if (service == null)
                return NotFound();

            return Ok(MapToPostDto(service));
        }

        // POST: api/sundayservices - Create Sunday service post (admin only)
        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateSundayService([FromBody] SundayServiceCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var service = new Post
            {
                AuthorId = userId!,
                Title = dto.Title,
                Body = dto.Body,
                PostType = "sunday_service",
                Attachments = JsonSerializer.Serialize(dto.Attachments),
                AllowComments = dto.AllowComments,
                AllowLikes = dto.AllowLikes,
                Pinned = false,
                Tags = JsonSerializer.Serialize(dto.Tags)
            };

            _context.Posts.Add(service);
            await _context.SaveChangesAsync();

            // Reload with author
            service = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == service.Id);

            return CreatedAtAction(nameof(GetSundayService), new { id = service.Id }, MapToPostDto(service));
        }

        // PUT: api/sundayservices/{id} - Update Sunday service (admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateSundayService(int id, [FromBody] SundayServiceCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var service = await _context.Posts.FindAsync(id);
            if (service == null || service.PostType != "sunday_service")
                return NotFound();

            service.Title = dto.Title;
            service.Body = dto.Body;
            service.Attachments = JsonSerializer.Serialize(dto.Attachments);
            service.AllowComments = dto.AllowComments;
            service.AllowLikes = dto.AllowLikes;
            service.Tags = JsonSerializer.Serialize(dto.Tags);

            await _context.SaveChangesAsync();

            // Reload with author
            service = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == service.Id);

            return Ok(MapToPostDto(service));
        }

        // DELETE: api/sundayservices/{id} - Delete Sunday service (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSundayService(int id)
        {
            var service = await _context.Posts.FindAsync(id);
            if (service == null || service.PostType != "sunday_service")
                return NotFound();

            _context.Posts.Remove(service);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/sundayservices/cleanup-expired - Delete services older than 7 days (admin only)
        [HttpPost("cleanup-expired")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CleanupExpiredServices()
        {
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);

            var expiredServices = await _context.Posts
                .Where(p => p.PostType == "sunday_service" && p.CreatedAt < sevenDaysAgo)
                .ToListAsync();

            if (expiredServices.Any())
            {
                _context.Posts.RemoveRange(expiredServices);
                await _context.SaveChangesAsync();
            }

            return Ok(new 
            { 
                message = $"Cleaned up {expiredServices.Count} expired Sunday service posts",
                deletedCount = expiredServices.Count
            });
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

    public class SundayServiceCreateDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public List<string> Attachments { get; set; } = new(); // Video/audio URLs, images
        public bool AllowComments { get; set; } = true;
        public bool AllowLikes { get; set; } = true;
        public List<string> Tags { get; set; } = new(); // e.g., "sermon", "worship", "youth"
    }
}