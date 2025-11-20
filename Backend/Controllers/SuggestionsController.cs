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
    public class SuggestionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SuggestionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/suggestions - Get all suggestions (latest first)
        [HttpGet]
        public async Task<IActionResult> GetSuggestions(
            [FromQuery] string? category = null,
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Suggestions
                .Include(s => s.Submitter)
                .Include(s => s.ModeratedBy)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category))
                query = query.Where(s => s.Category == category);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(s => s.Status == status);

            // Order by latest first
            query = query.OrderByDescending(s => s.CreatedAt);

            var total = await query.CountAsync();
            var suggestions = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var suggestionDtos = suggestions.Select(s => MapToSuggestionDto(s)).ToList();

            return Ok(new
            {
                items = suggestionDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/suggestions/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSuggestion(int id)
        {
            var suggestion = await _context.Suggestions
                .Include(s => s.Submitter)
                .Include(s => s.ModeratedBy)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (suggestion == null)
                return NotFound();

            return Ok(MapToSuggestionDto(suggestion));
        }

        // POST: api/suggestions - Submit a suggestion (anonymous by default)
        [HttpPost]
        public async Task<IActionResult> CreateSuggestion([FromBody] SuggestionCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var suggestion = new Suggestion
            {
                SubmitterId = dto.Anonymous ? null : userId,
                Title = dto.Title,
                Body = dto.Body,
                Category = dto.Category,
                Attachments = JsonSerializer.Serialize(dto.Attachments),
                ContactInfo = JsonSerializer.Serialize(dto.ContactInfo),
                Anonymous = dto.Anonymous,
                Status = "pending"
            };

            _context.Suggestions.Add(suggestion);
            await _context.SaveChangesAsync();

            // Reload with relationships
            suggestion = await _context.Suggestions
                .Include(s => s.Submitter)
                .Include(s => s.ModeratedBy)
                .FirstAsync(s => s.Id == suggestion.Id);

            return CreatedAtAction(nameof(GetSuggestion), new { id = suggestion.Id }, MapToSuggestionDto(suggestion));
        }

        // PUT: api/suggestions/{id}/status - Update suggestion status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateSuggestionStatus(int id, [FromBody] UpdateSuggestionStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var suggestion = await _context.Suggestions.FindAsync(id);
            if (suggestion == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            suggestion.Status = dto.Status;
            suggestion.ModeratedById = userId;

            await _context.SaveChangesAsync();

            // Reload with relationships
            suggestion = await _context.Suggestions
                .Include(s => s.Submitter)
                .Include(s => s.ModeratedBy)
                .FirstAsync(s => s.Id == suggestion.Id);

            return Ok(MapToSuggestionDto(suggestion));
        }

        // DELETE: api/suggestions/{id} - Delete suggestion (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteSuggestion(int id)
        {
            var suggestion = await _context.Suggestions.FindAsync(id);
            if (suggestion == null)
                return NotFound();

            _context.Suggestions.Remove(suggestion);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private SuggestionDto MapToSuggestionDto(Suggestion suggestion)
        {
            return new SuggestionDto
            {
                Id = suggestion.Id,
                Submitter = suggestion.Anonymous || suggestion.Submitter == null 
                    ? null 
                    : MapToUserDto(suggestion.Submitter),
                Title = suggestion.Title,
                Body = suggestion.Body,
                Category = suggestion.Category,
                Attachments = JsonSerializer.Deserialize<List<string>>(suggestion.Attachments) ?? new List<string>(),
                ContactInfo = JsonSerializer.Deserialize<Dictionary<string, string>>(suggestion.ContactInfo) ?? new Dictionary<string, string>(),
                Anonymous = suggestion.Anonymous,
                Status = suggestion.Status,
                CreatedAt = suggestion.CreatedAt,
                ModeratedBy = suggestion.ModeratedBy == null ? null : MapToUserDto(suggestion.ModeratedBy)
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

    public class UpdateSuggestionStatusDto
    {
        public string Status { get; set; } = null!; // pending, reviewed, approved, rejected
    }
}