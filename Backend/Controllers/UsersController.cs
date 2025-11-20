using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; // Add this using statement

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration; // Add this field declaration

        public UsersController(IAuthService authService, IEmailService emailService, IConfiguration configuration)
        {
            _authService = authService;
            _emailService = emailService;
            _configuration = configuration; // Add this assignment
        }

        [HttpPost]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateUser([FromBody] UserCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.CreateUserWithTokenAsync(dto);

            if (result == null)
                return BadRequest(new { message = "User with this email already exists" });

            var (user, password, loginToken) = result.Value;

            // Try to send welcome email
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
                message = "User created successfully",
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
                credentials = new
                {
                    temporaryPassword = password,
                    loginToken = loginToken.Token,
                    autoLoginUrl = autoLoginUrl,
                    tokenExpiresAt = loginToken.ExpiresAt
                },
                instructions = "You can copy these credentials and send them to the user manually if email delivery failed."
            });
        }
    }
}