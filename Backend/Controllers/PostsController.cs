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
    public class PostsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PostsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPosts(
            [FromQuery] string? postType = null,
            [FromQuery] bool? pinned = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Posts
                .Include(p => p.Author)
                .AsQueryable();

            if (!string.IsNullOrEmpty(postType))
                query = query.Where(p => p.PostType == postType);

            if (pinned.HasValue)
                query = query.Where(p => p.Pinned == pinned.Value);

            query = query.OrderByDescending(p => p.Pinned)
                         .ThenByDescending(p => p.CreatedAt);

            var total = await query.CountAsync();
            var posts = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var postDtos = posts.Select(p => MapToPostDto(p)).ToList();

            return Ok(new
            {
                items = postDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
                return NotFound();

            return Ok(MapToPostDto(post));
        }

        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreatePost([FromBody] PostCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var post = new Post
            {
                AuthorId = userId!,
                Title = dto.Title,
                Body = dto.Body,
                PostType = dto.PostType,
                Attachments = JsonSerializer.Serialize(dto.Attachments),
                AllowComments = dto.AllowComments,
                AllowLikes = dto.AllowLikes,
                Pinned = dto.Pinned,
                Tags = JsonSerializer.Serialize(dto.Tags),
                ScheduledAt = dto.ScheduledAt
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            // Reload with author
            post = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == post.Id);

            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, MapToPostDto(post));
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] PostCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only author or admin can update
            if (post.AuthorId != userId && userRole != "admin")
                return Forbid();

            post.Title = dto.Title;
            post.Body = dto.Body;
            post.PostType = dto.PostType;
            post.Attachments = JsonSerializer.Serialize(dto.Attachments);
            post.AllowComments = dto.AllowComments;
            post.AllowLikes = dto.AllowLikes;
            post.Pinned = dto.Pinned;
            post.Tags = JsonSerializer.Serialize(dto.Tags);
            post.ScheduledAt = dto.ScheduledAt;

            await _context.SaveChangesAsync();

            // Reload with author
            post = await _context.Posts
                .Include(p => p.Author)
                .FirstAsync(p => p.Id == post.Id);

            return Ok(MapToPostDto(post));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only author or admin can delete
            if (post.AuthorId != userId && userRole != "admin")
                return Forbid();

            _context.Posts.Remove(post);
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
}