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
    public class InteractionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InteractionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // LIKES
        [HttpPost("like")]
        public async Task<IActionResult> ToggleLike([FromBody] ToggleLikeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var existingLike = await _context.Likes
                .FirstOrDefaultAsync(l => 
                    l.UserId == userId && 
                    l.ParentType == dto.ParentType && 
                    l.ParentId == dto.ParentId);

            if (existingLike != null)
            {
                // Unlike
                _context.Likes.Remove(existingLike);
                await _context.SaveChangesAsync();

                return Ok(new { liked = false, message = "Like removed" });
            }
            else
            {
                // Like
                var like = new Like
                {
                    UserId = userId!,
                    ParentType = dto.ParentType,
                    ParentId = dto.ParentId
                };

                _context.Likes.Add(like);
                await _context.SaveChangesAsync();

                return Ok(new { liked = true, message = "Like added" });
            }
        }

        [HttpGet("likes/{parentType}/{parentId}")]
        public async Task<IActionResult> GetLikes(string parentType, int parentId)
        {
            var likes = await _context.Likes
                .Include(l => l.User)
                .Where(l => l.ParentType == parentType && l.ParentId == parentId)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();

            var likeDtos = likes.Select(l => new LikeDto
            {
                Id = l.Id,
                User = MapToUserDto(l.User),
                ParentType = l.ParentType,
                ParentId = l.ParentId,
                CreatedAt = l.CreatedAt
            }).ToList();

            return Ok(new
            {
                count = likeDtos.Count,
                likes = likeDtos
            });
        }

        // COMMENTS
        [HttpPost("comment")]
        public async Task<IActionResult> AddComment([FromBody] CommentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var comment = new Comment
            {
                AuthorId = userId!,
                ParentType = dto.ParentType,
                ParentId = dto.ParentId,
                Text = dto.Text,
                Attachments = JsonSerializer.Serialize(dto.Attachments)
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Reload with author
            comment = await _context.Comments
                .Include(c => c.Author)
                .FirstAsync(c => c.Id == comment.Id);

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                Author = MapToUserDto(comment.Author),
                ParentType = comment.ParentType,
                ParentId = comment.ParentId,
                Text = comment.Text,
                Attachments = JsonSerializer.Deserialize<List<string>>(comment.Attachments) ?? new List<string>(),
                CreatedAt = comment.CreatedAt,
                EditedAt = comment.EditedAt
            };

            return CreatedAtAction(nameof(GetComments), 
                new { parentType = comment.ParentType, parentId = comment.ParentId }, 
                commentDto);
        }

        [HttpGet("comments/{parentType}/{parentId}")]
        public async Task<IActionResult> GetComments(string parentType, int parentId)
        {
            var comments = await _context.Comments
                .Include(c => c.Author)
                .Where(c => c.ParentType == parentType && c.ParentId == parentId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            var commentDtos = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                Author = MapToUserDto(c.Author),
                ParentType = c.ParentType,
                ParentId = c.ParentId,
                Text = c.Text,
                Attachments = JsonSerializer.Deserialize<List<string>>(c.Attachments) ?? new List<string>(),
                CreatedAt = c.CreatedAt,
                EditedAt = c.EditedAt
            }).ToList();

            return Ok(new
            {
                count = commentDtos.Count,
                comments = commentDtos
            });
        }

        [HttpDelete("comment/{id}")]
        public async Task<IActionResult> DeleteComment(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only author or admin can delete
            if (comment.AuthorId != userId && userRole != "admin")
                return Forbid();

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("comment/{id}")]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] CommentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var comment = await _context.Comments.FindAsync(id);
            if (comment == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            // Only author can edit
            if (comment.AuthorId != userId)
                return Forbid();

            comment.Text = dto.Text;
            comment.Attachments = JsonSerializer.Serialize(dto.Attachments);
            comment.EditedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload with author
            comment = await _context.Comments
                .Include(c => c.Author)
                .FirstAsync(c => c.Id == comment.Id);

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                Author = MapToUserDto(comment.Author),
                ParentType = comment.ParentType,
                ParentId = comment.ParentId,
                Text = comment.Text,
                Attachments = JsonSerializer.Deserialize<List<string>>(comment.Attachments) ?? new List<string>(),
                CreatedAt = comment.CreatedAt,
                EditedAt = comment.EditedAt
            };

            return Ok(commentDto);
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