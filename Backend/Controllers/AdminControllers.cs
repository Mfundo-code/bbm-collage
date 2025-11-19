using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ApplicationDbContext _context;

        public SetupController(UserManager<User> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        /// <summary>
        /// Creates the initial admin user. This endpoint should be disabled in production!
        /// </summary>
        [HttpPost("create-admin")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
        {
            // Check if any users exist
            var userCount = await _context.Users.CountAsync();
            
            // Only allow if no users exist (first-time setup)
            if (userCount > 0)
            {
                return BadRequest(new { message = "Admin user already exists. This endpoint is only for initial setup." });
            }

            var adminEmail = dto.Email ?? "admin@mbs.com";
            var password = dto.Password ?? "Admin@123";

            var admin = new User
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = dto.FirstName ?? "System",
                LastName = dto.LastName ?? "Administrator",
                Role = "admin",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(admin, password);

            if (result.Succeeded)
            {
                return Ok(new
                {
                    message = "Admin user created successfully",
                    email = adminEmail,
                    warning = "Please change the password immediately after first login!"
                });
            }

            return BadRequest(new
            {
                message = "Failed to create admin user",
                errors = result.Errors.Select(e => e.Description)
            });
        }
    }

    public class CreateAdminDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}