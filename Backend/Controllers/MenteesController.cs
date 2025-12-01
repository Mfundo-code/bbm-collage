using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Backend.Models;
using Backend.DTOs;
using System.Text.Json;
using System.Collections.Generic;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MenteesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly JsonSerializerOptions _jsonOptions;

        public MenteesController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetMentees([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? mentorId = null)
        {
            var query = _context.Mentees
                .Include(me => me.User)
                .Include(me => me.Mentor)
                    .ThenInclude(m => m!.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(mentorId) && mentorId != "null")
            {
                if (int.TryParse(mentorId, out int mentorIdInt))
                {
                    query = query.Where(me => me.MentorId == mentorIdInt);
                }
            }
            else if (mentorId == "null")
            {
                query = query.Where(me => me.MentorId == null);
            }

            var mentees = await query
                .OrderByDescending(me => me.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await query.CountAsync();

            var menteeDtos = mentees.Select(me => new MenteeDto
            {
                Id = me.Id,
                User = new UserDto
                {
                    Id = me.User.Id,
                    Email = me.User.Email!,
                    FirstName = me.User.FirstName,
                    LastName = me.User.LastName,
                    Role = me.User.Role,
                    ProfilePhoto = me.User.ProfilePhoto,
                    ContactPhone = me.User.ContactPhone,
                    CreatedAt = me.User.CreatedAt
                },
                Mentor = me.Mentor != null ? new MentorDto
                {
                    Id = me.Mentor.Id,
                    User = new UserDto
                    {
                        Id = me.Mentor.User.Id,
                        Email = me.Mentor.User.Email!,
                        FirstName = me.Mentor.User.FirstName,
                        LastName = me.Mentor.User.LastName,
                        Role = me.Mentor.User.Role,
                        ProfilePhoto = me.Mentor.User.ProfilePhoto,
                        ContactPhone = me.Mentor.User.ContactPhone,
                        CreatedAt = me.Mentor.User.CreatedAt
                    },
                    AreaOfExpertise = me.Mentor.AreaOfExpertise,
                    Bio = me.Mentor.Bio,
                    Status = me.Mentor.Status,
                    CreatedAt = me.Mentor.CreatedAt
                } : null,
                LearningGoals = me.LearningGoals,
                Background = me.Background,
                PreferredTopics = JsonSerializer.Deserialize<List<string>>(me.PreferredTopics ?? "[]", _jsonOptions) ?? new List<string>(),
                Status = me.Status,
                CreatedAt = me.CreatedAt
            }).ToList();

            return Ok(new { items = menteeDtos, total });
        }

        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateMentee([FromBody] CreateMenteeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var existingMentee = await _context.Mentees
                .FirstOrDefaultAsync(m => m.UserId == dto.UserId);
            if (existingMentee != null)
            {
                return BadRequest("User is already a mentee");
            }

            var existingMentor = await _context.Mentors
                .FirstOrDefaultAsync(m => m.UserId == dto.UserId);
            if (existingMentor != null)
            {
                return BadRequest("User is already a mentor. A user cannot be both mentor and mentee.");
            }

            var mentee = new Mentee
            {
                UserId = dto.UserId,
                LearningGoals = dto.LearningGoals,
                Background = dto.Background,
                PreferredTopics = JsonSerializer.Serialize(dto.PreferredTopics ?? new List<string>(), _jsonOptions),
                Status = "active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Mentees.Add(mentee);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Mentee created successfully",
                mentee = mentee
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary,mentor")]
        public async Task<IActionResult> UpdateMentee(int id, [FromBody] UpdateMenteeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var mentee = await _context.Mentees
                .Include(me => me.Mentor)
                .FirstOrDefaultAsync(me => me.Id == id);

            if (mentee == null)
            {
                return NotFound("Mentee not found");
            }

            var currentUser = await _userManager.GetUserAsync(User);
            var isMentor = currentUser!.Role == "mentor" || _context.Mentors.Any(m => m.UserId == currentUser.Id);
            
            if (currentUser.Role != "admin" && currentUser.Role != "secretary" && 
                !(isMentor && mentee.Mentor != null && mentee.Mentor.UserId == currentUser.Id))
            {
                return Forbid();
            }

            mentee.LearningGoals = dto.LearningGoals ?? mentee.LearningGoals;
            mentee.Background = dto.Background ?? mentee.Background;
            
            if (dto.PreferredTopics != null)
                mentee.PreferredTopics = JsonSerializer.Serialize(dto.PreferredTopics, _jsonOptions);
            
            mentee.Status = dto.Status ?? mentee.Status;

            if (dto.MentorId.HasValue && (currentUser.Role == "admin" || currentUser.Role == "secretary"))
            {
                if (dto.MentorId.Value == 0)
                {
                    if (mentee.MentorId != null)
                    {
                        var oldMentor = await _context.Mentors.FindAsync(mentee.MentorId);
                        if (oldMentor != null)
                        {
                            oldMentor.CurrentMentees = Math.Max(0, oldMentor.CurrentMentees - 1);
                        }
                        mentee.MentorId = null;
                    }
                }
                else
                {
                    var mentor = await _context.Mentors
                        .Include(m => m.Mentees)
                        .FirstOrDefaultAsync(m => m.Id == dto.MentorId.Value);
                    
                    if (mentor == null)
                    {
                        return NotFound("Mentor not found");
                    }

                    if (mentor.Mentees.Count >= mentor.MaxMentees)
                    {
                        return BadRequest($"Mentor has reached the maximum number of mentees ({mentor.MaxMentees})");
                    }

                    if (mentee.MentorId != null && mentee.MentorId != dto.MentorId.Value)
                    {
                        var oldMentor = await _context.Mentors.FindAsync(mentee.MentorId);
                        if (oldMentor != null)
                        {
                            oldMentor.CurrentMentees = Math.Max(0, oldMentor.CurrentMentees - 1);
                        }
                    }

                    mentee.MentorId = dto.MentorId.Value;
                    mentor.CurrentMentees = mentor.Mentees.Count(me => me.MentorId == mentor.Id);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Mentee updated successfully",
                mentee = mentee
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> DeleteMentee(int id)
        {
            var mentee = await _context.Mentees
                .FirstOrDefaultAsync(me => me.Id == id);

            if (mentee == null)
            {
                return NotFound("Mentee not found");
            }

            if (mentee.MentorId != null)
            {
                var mentor = await _context.Mentors.FindAsync(mentee.MentorId);
                if (mentor != null)
                {
                    mentor.CurrentMentees = Math.Max(0, mentor.CurrentMentees - 1);
                }
            }

            _context.Mentees.Remove(mentee);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mentee deleted successfully" });
        }
    }
}