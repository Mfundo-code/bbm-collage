using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto);

            if (result == null)
                return Unauthorized(new { message = "Invalid email or password" });

            return Ok(result);
        }

        [HttpPost("auto-login")]
        [AllowAnonymous]
        public async Task<IActionResult> AutoLogin([FromBody] AutoLoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.AutoLoginAsync(dto.Token, ipAddress);

            if (result == null)
                return Unauthorized(new { message = "Invalid or expired token" });

            return Ok(result);
        }

        [HttpGet("auto-login")]
        [AllowAnonymous]
        public async Task<IActionResult> AutoLoginGet([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
                return BadRequest(new { message = "Token is required" });

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.AutoLoginAsync(token, ipAddress);

            if (result == null)
                return Unauthorized(new { message = "Invalid or expired token" });

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var firstName = User.FindFirst("FirstName")?.Value;
            var lastName = User.FindFirst("LastName")?.Value;

            return Ok(new
            {
                id = userId,
                email = email,
                role = role,
                firstName = firstName,
                lastName = lastName
            });
        }
    }
}