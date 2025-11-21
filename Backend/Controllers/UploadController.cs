using System;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public UploadController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] string fileType)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Validate file size based on type
            var maxSize = fileType switch
            {
                "video" => 350 * 1024 * 1024, // 350MB
                "image" => 100 * 1024 * 1024, // 100MB
                "audio" => 350 * 1024 * 1024, // 350MB
                "pdf" => 100 * 1024 * 1024,   // 100MB
                _ => 100 * 1024 * 1024
            };

            if (file.Length > maxSize)
                return BadRequest($"File size too large. Maximum size is {maxSize / (1024 * 1024)}MB");

            try
            {
                // Generate unique filename
                var fileExtension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create media item record
                var mediaItem = new MediaItem
                {
                    OwnerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!,
                    MediaType = fileType,
                    File = $"/uploads/{fileName}",
                    SizeBytes = file.Length,
                    UploadedAt = DateTime.UtcNow,
                    ExpiresAt = fileType == "video" || fileType == "audio" 
                        ? DateTime.UtcNow.AddDays(7) 
                        : (DateTime?)null,
                    Status = "active"
                };

                _context.MediaItems.Add(mediaItem);
                await _context.SaveChangesAsync();

                return Ok(new { url = mediaItem.File });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("cleanup-expired")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CleanupExpiredMedia()
        {
            try
            {
                var expiredMedia = await _context.MediaItems
                    .Where(m => m.ExpiresAt != null && m.ExpiresAt < DateTime.UtcNow)
                    .ToListAsync();

                int deletedCount = 0;

                foreach (var media in expiredMedia)
                {
                    // Delete physical file
                    var filePath = Path.Combine(_environment.WebRootPath, media.File.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }

                    _context.MediaItems.Remove(media);
                    deletedCount++;
                }

                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = $"Cleaned up {deletedCount} expired media files",
                    deletedCount = deletedCount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during cleanup: {ex.Message}");
            }
        }
    }
}