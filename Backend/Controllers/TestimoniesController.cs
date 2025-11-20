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
    public class TestimoniesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestimoniesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/testimonies - Get all testimonies (latest first)
        [HttpGet]
        public async Task<IActionResult> GetTestimonies(
            [FromQuery] bool? featured = null,
            [FromQuery] string? outreachTag = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Testimonies
                .Include(t => t.Author)
                .AsQueryable();

            if (featured.HasValue)
                query = query.Where(t => t.Featured == featured.Value);

            if (!string.IsNullOrEmpty(outreachTag))
                query = query.Where(t => t.OutreachTag == outreachTag);

            // Featured first, then latest
            query = query.OrderByDescending(t => t.Featured)
                         .ThenByDescending(t => t.CreatedAt);

            var total = await query.CountAsync();
            var testimonies = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var testimonyDtos = testimonies.Select(t => MapToTestimonyDto(t)).ToList();

            return Ok(new
            {
                items = testimonyDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/testimonies/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTestimony(int id)
        {
            var testimony = await _context.Testimonies
                .Include(t => t.Author)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (testimony == null)
                return NotFound();

            return Ok(MapToTestimonyDto(testimony));
        }

        // POST: api/testimonies - Add testimony (any authenticated user)
        [HttpPost]
        public async Task<IActionResult> CreateTestimony([FromBody] TestimonyCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var testimony = new Testimony
            {
                AuthorId = userId!,
                Title = dto.Title,
                Body = dto.Body,
                Attachments = JsonSerializer.Serialize(dto.Attachments),
                Location = dto.Location,
                OutreachTag = dto.OutreachTag,
                Featured = false
            };

            _context.Testimonies.Add(testimony);
            await _context.SaveChangesAsync();

            // Reload with author
            testimony = await _context.Testimonies
                .Include(t => t.Author)
                .FirstAsync(t => t.Id == testimony.Id);

            return CreatedAtAction(nameof(GetTestimony), new { id = testimony.Id }, MapToTestimonyDto(testimony));
        }

        // PUT: api/testimonies/{id} - Update testimony (author or admin)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTestimony(int id, [FromBody] TestimonyCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var testimony = await _context.Testimonies.FindAsync(id);
            if (testimony == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only author or admin can update
            if (testimony.AuthorId != userId && userRole != "admin")
                return Forbid();

            testimony.Title = dto.Title;
            testimony.Body = dto.Body;
            testimony.Attachments = JsonSerializer.Serialize(dto.Attachments);
            testimony.Location = dto.Location;
            testimony.OutreachTag = dto.OutreachTag;

            await _context.SaveChangesAsync();

            // Reload with author
            testimony = await _context.Testimonies
                .Include(t => t.Author)
                .FirstAsync(t => t.Id == testimony.Id);

            return Ok(MapToTestimonyDto(testimony));
        }

        // PUT: api/testimonies/{id}/featured - Toggle featured (admin only)
        [HttpPut("{id}/featured")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> ToggleFeatured(int id)
        {
            var testimony = await _context.Testimonies.FindAsync(id);
            if (testimony == null)
                return NotFound();

            testimony.Featured = !testimony.Featured;
            await _context.SaveChangesAsync();

            // Reload with author
            testimony = await _context.Testimonies
                .Include(t => t.Author)
                .FirstAsync(t => t.Id == testimony.Id);

            return Ok(MapToTestimonyDto(testimony));
        }

        // DELETE: api/testimonies/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTestimony(int id)
        {
            var testimony = await _context.Testimonies.FindAsync(id);
            if (testimony == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only author or admin can delete
            if (testimony.AuthorId != userId && userRole != "admin")
                return Forbid();

            _context.Testimonies.Remove(testimony);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private TestimonyDto MapToTestimonyDto(Testimony testimony)
        {
            var likeCount = _context.Likes
                .Count(l => l.ParentType == "testimony" && l.ParentId == testimony.Id);

            var commentCount = _context.Comments
                .Count(c => c.ParentType == "testimony" && c.ParentId == testimony.Id);

            return new TestimonyDto
            {
                Id = testimony.Id,
                Author = MapToUserDto(testimony.Author),
                Title = testimony.Title,
                Body = testimony.Body,
                Attachments = JsonSerializer.Deserialize<List<string>>(testimony.Attachments) ?? new List<string>(),
                Location = testimony.Location,
                OutreachTag = testimony.OutreachTag,
                CreatedAt = testimony.CreatedAt,
                Featured = testimony.Featured,
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