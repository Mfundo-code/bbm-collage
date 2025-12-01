using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Backend.Models;
using Backend.DTOs;
using System.Text.Json;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MentorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly JsonSerializerOptions _jsonOptions;

        public MentorsController(ApplicationDbContext context, UserManager<User> userManager)
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
        public async Task<IActionResult> GetMentors([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var mentors = await _context.Mentors
                .Include(m => m.User)
                .Include(m => m.Mentees)
                    .ThenInclude(me => me.User)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var total = await _context.Mentors.CountAsync();

            var mentorDtos = mentors.Select(m => new MentorDto
            {
                Id = m.Id,
                User = new UserDto
                {
                    Id = m.User.Id,
                    Email = m.User.Email!,
                    FirstName = m.User.FirstName,
                    LastName = m.User.LastName,
                    Role = m.User.Role,
                    ProfilePhoto = m.User.ProfilePhoto,
                    ContactPhone = m.User.ContactPhone,
                    CreatedAt = m.User.CreatedAt
                },
                AreaOfExpertise = m.AreaOfExpertise,
                Bio = m.Bio,
                Availability = JsonSerializer.Deserialize<object>(m.Availability ?? "{}", _jsonOptions) ?? new { },
                CommunicationChannels = JsonSerializer.Deserialize<List<string>>(m.CommunicationChannels ?? "[]", _jsonOptions) ?? new List<string>(),
                MaxMentees = m.MaxMentees,
                CurrentMentees = m.CurrentMentees,
                Status = m.Status,
                CreatedAt = m.CreatedAt,
                Mentees = m.Mentees.Select(me => new MenteeDto
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
                    LearningGoals = me.LearningGoals,
                    Background = me.Background,
                    PreferredTopics = JsonSerializer.Deserialize<List<string>>(me.PreferredTopics ?? "[]", _jsonOptions) ?? new List<string>(),
                    Status = me.Status,
                    CreatedAt = me.CreatedAt
                }).ToList()
            }).ToList();

            return Ok(new { items = mentorDtos, total });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMentor(int id)
        {
            var mentor = await _context.Mentors
                .Include(m => m.User)
                .Include(m => m.Mentees)
                    .ThenInclude(me => me.User)
                .Include(m => m.Sessions)
                    .ThenInclude(s => s.Mentee)
                    .ThenInclude(me => me.User)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }

            var mentorDto = new MentorDto
            {
                Id = mentor.Id,
                User = new UserDto
                {
                    Id = mentor.User.Id,
                    Email = mentor.User.Email!,
                    FirstName = mentor.User.FirstName,
                    LastName = mentor.User.LastName,
                    Role = mentor.User.Role,
                    ProfilePhoto = mentor.User.ProfilePhoto,
                    ContactPhone = mentor.User.ContactPhone,
                    CreatedAt = mentor.User.CreatedAt
                },
                AreaOfExpertise = mentor.AreaOfExpertise,
                Bio = mentor.Bio,
                Availability = JsonSerializer.Deserialize<object>(mentor.Availability ?? "{}", _jsonOptions) ?? new { },
                CommunicationChannels = JsonSerializer.Deserialize<List<string>>(mentor.CommunicationChannels ?? "[]", _jsonOptions) ?? new List<string>(),
                MaxMentees = mentor.MaxMentees,
                CurrentMentees = mentor.CurrentMentees,
                Status = mentor.Status,
                CreatedAt = mentor.CreatedAt,
                Mentees = mentor.Mentees.Select(me => new MenteeDto
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
                    LearningGoals = me.LearningGoals,
                    Background = me.Background,
                    PreferredTopics = JsonSerializer.Deserialize<List<string>>(me.PreferredTopics ?? "[]", _jsonOptions) ?? new List<string>(),
                    Status = me.Status,
                    CreatedAt = me.CreatedAt
                }).ToList()
            };

            return Ok(mentorDto);
        }

        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateMentor([FromBody] CreateMentorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var existingMentor = await _context.Mentors
                .FirstOrDefaultAsync(m => m.UserId == dto.UserId);
            if (existingMentor != null)
            {
                return BadRequest("User is already a mentor");
            }

            var existingMentee = await _context.Mentees
                .FirstOrDefaultAsync(m => m.UserId == dto.UserId);
            if (existingMentee != null)
            {
                return BadRequest("User is already a mentee. A user cannot be both mentor and mentee.");
            }

            var mentor = new Mentor
            {
                UserId = dto.UserId,
                AreaOfExpertise = dto.AreaOfExpertise,
                Bio = dto.Bio,
                MaxMentees = dto.MaxMentees,
                Availability = JsonSerializer.Serialize(dto.Availability ?? new 
                { 
                    days = new[] { "Monday", "Wednesday", "Friday" },
                    timeSlots = new[] { "9:00-12:00", "14:00-17:00" }
                }, _jsonOptions),
                CommunicationChannels = JsonSerializer.Serialize(dto.CommunicationChannels ?? new List<string> { "email" }, _jsonOptions),
                Status = "active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Mentors.Add(mentor);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Mentor created successfully",
                mentor = mentor
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin,secretary,mentor")]
        public async Task<IActionResult> UpdateMentor(int id, [FromBody] UpdateMentorDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var mentor = await _context.Mentors
                .Include(m => m.Mentees)
                .FirstOrDefaultAsync(m => m.Id == id);
                
            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }

            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser!.Role != "admin" && currentUser.Role != "secretary" && mentor.UserId != currentUser.Id)
            {
                return Forbid();
            }

            mentor.AreaOfExpertise = dto.AreaOfExpertise ?? mentor.AreaOfExpertise;
            mentor.Bio = dto.Bio ?? mentor.Bio;
            mentor.MaxMentees = dto.MaxMentees ?? mentor.MaxMentees;
            
            if (dto.Availability != null)
                mentor.Availability = JsonSerializer.Serialize(dto.Availability, _jsonOptions);
            
            if (dto.CommunicationChannels != null)
                mentor.CommunicationChannels = JsonSerializer.Serialize(dto.CommunicationChannels, _jsonOptions);
            
            mentor.Status = dto.Status ?? mentor.Status;
            mentor.UpdatedAt = DateTime.UtcNow;
            mentor.CurrentMentees = mentor.Mentees.Count;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Mentor updated successfully",
                mentor = mentor
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> DeleteMentor(int id)
        {
            var mentor = await _context.Mentors
                .Include(m => m.Mentees)
                .Include(m => m.Sessions)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }

            if (mentor.Mentees.Any())
            {
                foreach (var mentee in mentor.Mentees)
                {
                    mentee.MentorId = null;
                }
            }

            _context.Mentors.Remove(mentor);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mentor deleted successfully" });
        }

        [HttpPost("{mentorId}/mentees/{menteeId}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> AssignMentee(int mentorId, string menteeId)
        {
            var mentor = await _context.Mentors
                .Include(m => m.Mentees)
                .FirstOrDefaultAsync(m => m.Id == mentorId);

            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }

            var mentee = await _context.Mentees
                .FirstOrDefaultAsync(m => m.UserId == menteeId);

            if (mentee == null)
            {
                return NotFound("Mentee not found");
            }

            if (mentee.MentorId != null)
            {
                return BadRequest("Mentee is already assigned to a mentor");
            }

            if (mentor.Mentees.Count >= mentor.MaxMentees)
            {
                return BadRequest($"Mentor has reached the maximum number of mentees ({mentor.MaxMentees})");
            }

            mentee.MentorId = mentorId;
            mentor.CurrentMentees = mentor.Mentees.Count + 1;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Mentee assigned successfully" });
        }

        [HttpDelete("{mentorId}/mentees/{menteeId}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> RemoveMentee(int mentorId, string menteeId)
        {
            var mentor = await _context.Mentors
                .Include(m => m.Mentees)
                .FirstOrDefaultAsync(m => m.Id == mentorId);

            if (mentor == null)
            {
                return NotFound("Mentor not found");
            }

            var mentee = mentor.Mentees.FirstOrDefault(m => m.UserId == menteeId);
            if (mentee == null)
            {
                return NotFound("Mentee not found for this mentor");
            }

            mentee.MentorId = null;
            mentor.CurrentMentees = Math.Max(0, mentor.CurrentMentees - 1);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Mentee removed successfully" });
        }

        [HttpGet("available-users")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> GetAvailableUsers()
        {
            try
            {
                Console.WriteLine($"Starting GetAvailableUsers at {DateTime.UtcNow}");
                
                var existingMentorIds = await _context.Mentors.Select(m => m.UserId).ToListAsync();
                var existingMenteeIds = await _context.Mentees.Select(m => m.UserId).ToListAsync();
                
                Console.WriteLine($"Existing mentor IDs: {existingMentorIds.Count}");
                Console.WriteLine($"Existing mentee IDs: {existingMenteeIds.Count}");

                var users = await _context.Users
                    .Where(u => !existingMentorIds.Contains(u.Id) && !existingMenteeIds.Contains(u.Id))
                    .Include(u => u.Student)
                    .Include(u => u.Missionary)
                    .Include(u => u.Alumni)
                    .OrderBy(u => u.FirstName)
                    .ThenBy(u => u.LastName)
                    .ToListAsync();

                Console.WriteLine($"Found {users.Count} available users");
                
                // Create an anonymous object for each user to avoid circular references
                var result = users.Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FirstName,
                    u.LastName,
                    u.Role,
                    u.ProfilePhoto,
                    u.ContactPhone,
                    u.CreatedAt,
                    Student = u.Student == null ? null : new 
                    { 
                        u.Student.Program, 
                        u.Student.ClassYear 
                    },
                    Missionary = u.Missionary == null ? null : new 
                    { 
                        u.Missionary.LocationCountry 
                    },
                    Alumni = u.Alumni == null ? null : new 
                    { 
                        u.Alumni.GraduationYear 
                    }
                }).ToList();

                return Ok(new { items = result });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAvailableUsers: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}