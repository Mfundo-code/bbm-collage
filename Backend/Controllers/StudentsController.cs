using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;

        public StudentsController(
            IAuthService authService,
            ApplicationDbContext context,
            IEmailService emailService,
            IConfiguration configuration,
            UserManager<User> userManager)
        {
            _authService = authService;
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetStudents([FromQuery] string? program, [FromQuery] string? classYear, [FromQuery] string? enrollmentYear)
        {
            var query = _context.Students
                .Include(s => s.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(program))
                query = query.Where(s => s.Program == program);

            if (!string.IsNullOrEmpty(classYear))
                query = query.Where(s => s.ClassYear == classYear);

            if (!string.IsNullOrEmpty(enrollmentYear))
            {
                var year = int.Parse(enrollmentYear);
                query = query.Where(s => s.EnrollmentDate.Year == year);
            }

            var students = await query
                .OrderByDescending(s => s.EnrollmentDate)
                .ToListAsync();

            var result = students.Select(s => new
            {
                user = new UserDto
                {
                    Id = s.UserId,
                    Email = s.User.Email!,
                    FirstName = s.User.FirstName,
                    LastName = s.User.LastName,
                    Role = s.User.Role,
                    ProfilePhoto = s.User.ProfilePhoto,
                    ContactPhone = s.User.ContactPhone,
                    CreatedAt = s.User.CreatedAt
                },
                enrollmentDate = s.EnrollmentDate,
                graduationDate = s.GraduationDate,
                program = s.Program,
                classYear = s.ClassYear,
                tags = !string.IsNullOrEmpty(s.Tags) ? 
                    System.Text.Json.JsonSerializer.Deserialize<List<string>>(s.Tags) : new List<string>(),
                notes = s.Notes
            }).ToList();

            return Ok(new { items = result });
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetStudent(string userId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student not found" });

            return Ok(new
            {
                user = new UserDto
                {
                    Id = student.UserId,
                    Email = student.User.Email!,
                    FirstName = student.User.FirstName,
                    LastName = student.User.LastName,
                    Role = student.User.Role,
                    ProfilePhoto = student.User.ProfilePhoto,
                    ContactPhone = student.User.ContactPhone,
                    CreatedAt = student.User.CreatedAt
                },
                enrollmentDate = student.EnrollmentDate,
                graduationDate = student.GraduationDate,
                program = student.Program,
                classYear = student.ClassYear,
                tags = !string.IsNullOrEmpty(student.Tags) ? 
                    System.Text.Json.JsonSerializer.Deserialize<List<string>>(student.Tags) : new List<string>(),
                notes = student.Notes
            });
        }

        [HttpPost]
        [Authorize(Roles = "admin,secretary,pastor")]
        public async Task<IActionResult> CreateStudent([FromBody] CreateStudentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Create user DTO
            var userDto = new UserCreateDto
            {
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Role = "student",
                ContactPhone = dto.ContactPhone,
                ProfilePhoto = dto.ProfilePhoto
            };

            // Create user with token
            var result = await _authService.CreateUserWithTokenAsync(userDto);
            if (result == null)
                return BadRequest(new { message = "User with this email already exists" });

            var (user, password, loginToken) = result.Value;

            // Create student record
            var student = new Student
            {
                UserId = user.Id,
                EnrollmentDate = dto.EnrollmentDate,
                GraduationDate = dto.GraduationDate,
                Program = dto.Program,
                ClassYear = dto.ClassYear,
                Tags = dto.Tags != null ? 
                    System.Text.Json.JsonSerializer.Serialize(dto.Tags) : "[]",
                Notes = dto.Notes
            };

            _context.Students.Add(student);
            await _context.SaveChangesAsync();

            // Send welcome email
            bool emailSent = false;
            string emailMessage = "Failed to send welcome email";
            
            try
            {
                emailSent = await _emailService.SendWelcomeEmailAsync(user, password, loginToken);
                emailMessage = emailSent ? "Welcome email sent successfully" : "Failed to send welcome email";
            }
            catch (Exception ex)
            {
                emailMessage = $"Email sending failed: {ex.Message}";
            }

            var siteUrl = _configuration["SiteUrl"] ?? "http://localhost:3000";
            var autoLoginUrl = $"{siteUrl}/auto-login?token={loginToken.Token}";

            return Ok(new
            {
                message = "Student created successfully",
                emailStatus = emailMessage,
                user = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role,
                    ContactPhone = user.ContactPhone,
                    CreatedAt = user.CreatedAt
                },
                student = new
                {
                    enrollmentDate = student.EnrollmentDate,
                    graduationDate = student.GraduationDate,
                    program = student.Program,
                    classYear = student.ClassYear,
                    tags = dto.Tags,
                    notes = student.Notes
                },
                credentials = new
                {
                    temporaryPassword = password,
                    loginToken = loginToken.Token,
                    autoLoginUrl = autoLoginUrl,
                    tokenExpiresAt = loginToken.ExpiresAt
                }
            });
        }

        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateStudent(string userId, [FromBody] UpdateStudentDto dto)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student not found" });

            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            // Check permissions (admin, secretary, pastor, or own profile)
            if (!User.IsInRole("admin") && !User.IsInRole("secretary") && !User.IsInRole("pastor") && currentUser.Id != userId)
                return Forbid();

            // Update user info
            if (!string.IsNullOrEmpty(dto.FirstName))
                student.User.FirstName = dto.FirstName;

            if (!string.IsNullOrEmpty(dto.LastName))
                student.User.LastName = dto.LastName;

            if (!string.IsNullOrEmpty(dto.ContactPhone))
                student.User.ContactPhone = dto.ContactPhone;

            if (!string.IsNullOrEmpty(dto.ProfilePhoto))
                student.User.ProfilePhoto = dto.ProfilePhoto;

            // Update student info
            if (dto.EnrollmentDate.HasValue)
                student.EnrollmentDate = dto.EnrollmentDate.Value;

            if (dto.GraduationDate.HasValue)
                student.GraduationDate = dto.GraduationDate;

            if (!string.IsNullOrEmpty(dto.Program))
                student.Program = dto.Program;

            if (!string.IsNullOrEmpty(dto.ClassYear))
                student.ClassYear = dto.ClassYear;

            if (dto.Tags != null)
                student.Tags = System.Text.Json.JsonSerializer.Serialize(dto.Tags);

            if (dto.Notes != null)
                student.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Student updated successfully",
                user = new UserDto
                {
                    Id = student.UserId,
                    Email = student.User.Email!,
                    FirstName = student.User.FirstName,
                    LastName = student.User.LastName,
                    Role = student.User.Role,
                    ProfilePhoto = student.User.ProfilePhoto,
                    ContactPhone = student.User.ContactPhone,
                    CreatedAt = student.User.CreatedAt
                },
                student = new
                {
                    enrollmentDate = student.EnrollmentDate,
                    graduationDate = student.GraduationDate,
                    program = student.Program,
                    classYear = student.ClassYear,
                    tags = !string.IsNullOrEmpty(student.Tags) ? 
                        System.Text.Json.JsonSerializer.Deserialize<List<string>>(student.Tags) : new List<string>(),
                    notes = student.Notes
                }
            });
        }

        [HttpDelete("{userId}")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> DeleteStudent(string userId)
        {
            var student = await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student not found" });

            // Delete student record first
            _context.Students.Remove(student);

            // Then delete the user
            var user = student.User;
            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to delete student account" });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Student deleted successfully" });
        }

        [HttpGet("enrollment-years")]
        public async Task<IActionResult> GetEnrollmentYears()
        {
            var years = await _context.Students
                .Select(s => s.EnrollmentDate.Year)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();

            return Ok(years);
        }

        [HttpGet("programs")]
        public async Task<IActionResult> GetPrograms()
        {
            var programs = await _context.Students
                .Where(s => !string.IsNullOrEmpty(s.Program))
                .Select(s => s.Program!)
                .Distinct()
                .OrderBy(p => p)
                .ToListAsync();

            return Ok(programs);
        }

        [HttpGet("class-years")]
        public async Task<IActionResult> GetClassYears()
        {
            var classYears = await _context.Students
                .Where(s => !string.IsNullOrEmpty(s.ClassYear))
                .Select(s => s.ClassYear!)
                .Distinct()
                .OrderByDescending(y => y)
                .ToListAsync();

            return Ok(classYears);
        }

        [HttpPost("{userId}/follow")]
        public async Task<IActionResult> FollowStudent(string userId)
        {
            // This would typically add to a follow table
            // For now, just return success
            await Task.CompletedTask;
            return Ok(new { message = "Following student" });
        }

        [HttpDelete("{userId}/follow")]
        public async Task<IActionResult> UnfollowStudent(string userId)
        {
            // This would typically remove from a follow table
            // For now, just return success
            await Task.CompletedTask;
            return Ok(new { message = "Unfollowed student" });
        }

        [HttpGet("{userId}/progress")]
        public async Task<IActionResult> GetStudentProgress(string userId)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (student == null)
                return NotFound(new { message = "Student not found" });

            // Get homiletics entries count
            var homileticsCount = await _context.HomileticsEntries
                .CountAsync(h => h.StudentId == userId);

            // Calculate progress based on enrollment duration
            var enrollmentDuration = DateTime.UtcNow - student.EnrollmentDate;
            var totalDays = enrollmentDuration.TotalDays;
            var progressPercentage = Math.Min(totalDays / 365 * 100, 100); // Assuming 1-year program

            return Ok(new
            {
                enrollmentDate = student.EnrollmentDate,
                daysEnrolled = Math.Floor(totalDays),
                progressPercentage = Math.Round(progressPercentage, 1),
                homileticsEntries = homileticsCount,
                program = student.Program,
                status = student.GraduationDate.HasValue && student.GraduationDate <= DateTime.UtcNow ? 
                    "Graduated" : "Active"
            });
        }
    }
}