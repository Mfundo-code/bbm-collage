using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public SetupController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        /// <summary>
        /// Resets a user's password directly. Practice/dev use only - not for production!
        /// </summary>
        [HttpPost("reset-admin-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetAdminPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);

            if (result.Succeeded)
            {
                return Ok(new { message = "Password reset successfully" });
            }

            return BadRequest(new
            {
                message = "Failed to reset password",
                errors = result.Errors.Select(e => e.Description)
            });
        }
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }
}