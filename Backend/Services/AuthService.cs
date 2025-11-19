using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto);
        Task<LoginResponseDto?> AutoLoginAsync(string token, string? ipAddress);
        Task<(User user, string password, OneTimeLoginToken token)?> CreateUserWithTokenAsync(UserCreateDto dto);
        Task<OneTimeLoginToken> GenerateLoginTokenAsync(User user);
    }

    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return null;

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
                return null;

            user.LastLoginDateUtc = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var token = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                Token = token,
                User = MapToUserDto(user)
            };
        }

        public async Task<LoginResponseDto?> AutoLoginAsync(string tokenString, string? ipAddress)
        {
            var loginToken = await _context.OneTimeLoginTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == tokenString);

            if (loginToken == null || !loginToken.IsValid())
                return null;

            loginToken.MarkAsUsed(ipAddress);
            await _context.SaveChangesAsync();

            var user = loginToken.User;
            user.LastLoginDateUtc = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var jwtToken = GenerateJwtToken(user);

            return new LoginResponseDto
            {
                Token = jwtToken,
                User = MapToUserDto(user)
            };
        }

        public async Task<(User user, string password, OneTimeLoginToken token)?> CreateUserWithTokenAsync(UserCreateDto dto)
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return null;

            // Generate random password
            var password = GenerateRandomPassword();

            // Create user
            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Role = dto.Role,
                ContactPhone = dto.ContactPhone,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                return null;

            // Generate login token
            var loginToken = await GenerateLoginTokenAsync(user);

            return (user, password, loginToken);
        }

        public async Task<OneTimeLoginToken> GenerateLoginTokenAsync(User user)
        {
            var expiryHours = _configuration.GetValue<int>("AutoLoginTokenExpiryHours", 24);

            var loginToken = new OneTimeLoginToken
            {
                UserId = user.Id,
                Token = GenerateSecureToken(),
                ExpiresAt = DateTime.UtcNow.AddHours(expiryHours)
            };

            _context.OneTimeLoginTokens.Add(loginToken);
            await _context.SaveChangesAsync();

            return loginToken;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Role)
            };

            if (!string.IsNullOrEmpty(user.FirstName))
                claims.Add(new Claim("FirstName", user.FirstName));
            
            if (!string.IsNullOrEmpty(user.LastName))
                claims.Add(new Claim("LastName", user.LastName));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateSecureToken()
        {
            var randomBytes = new byte[48];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }

        private static string GenerateRandomPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 12)
                .Select(s => s[random.Next(s.Length)]).ToArray());
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