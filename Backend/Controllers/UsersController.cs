using System;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;

        public UsersController(IAuthService authService, IEmailService emailService)
        {
            _authService = authService;
            _emailService = emailService;
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

            // Send welcome email (don't wait for it)
            _ = _emailService.SendWelcomeEmailAsync(user, password, loginToken);

            return Ok(new
            {
                message = "User created successfully. Welcome email sent.",
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
                temporaryPassword = password,
                loginToken = loginToken.Token
            });
        }
    }
}