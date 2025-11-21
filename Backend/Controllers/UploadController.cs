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
    [RequestFormLimits(MultipartBodyLengthLimit = 368435456)] // 350MB
    [RequestSizeLimit(368435456)] // 350MB
    public class UploadController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<UploadController> _logger;

        public UploadController(
            ApplicationDbContext context, 
            IWebHostEnvironment environment,
            ILogger<UploadController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        public async Task<IActionResult> UploadFile(IFormFile file, [FromForm] string fileType)
        {
            _logger.LogInformation($"Upload request received - FileType: {fileType}");
            
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("No file uploaded");
                return BadRequest(new { message = "No file uploaded" });
            }

            _logger.LogInformation($"File received: {file.FileName}, Size: {file.Length} bytes, ContentType: {file.ContentType}");

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
            {
                var maxSizeMB = maxSize / (1024 * 1024);
                _logger.LogWarning($"File size {file.Length} exceeds maximum {maxSize}");
                return BadRequest(new { message = $"File size too large. Maximum size is {maxSizeMB}MB" });
            }

            try
            {
                // CRITICAL FIX: Get the proper path and ensure directory exists
                string uploadsFolder;
                
                if (string.IsNullOrEmpty(_environment.WebRootPath))
                {
                    // If WebRootPath is not set, use ContentRootPath instead
                    _logger.LogWarning("WebRootPath is null, using ContentRootPath");
                    var contentRoot = _environment.ContentRootPath;
                    uploadsFolder = Path.Combine(contentRoot, "wwwroot", "uploads");
                }
                else
                {
                    uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                }
                
                _logger.LogInformation($"Uploads folder path: {uploadsFolder}");
                
                // Ensure uploads folder exists
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    _logger.LogInformation($"Created uploads directory: {uploadsFolder}");
                }

                // Generate unique filename
                var fileExtension = Path.GetExtension(file.FileName);
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                _logger.LogInformation($"Saving file to: {filePath}");

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                _logger.LogInformation($"File saved successfully: {fileName}");

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

                _logger.LogInformation($"Media item created in database with ID: {mediaItem.Id}");

                // Return the full URL for the file
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var fileUrl = $"{baseUrl}/uploads/{fileName}";
                
                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error uploading file: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
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
                    try
                    {
                        // Delete physical file
                        string uploadsFolder;
                        if (string.IsNullOrEmpty(_environment.WebRootPath))
                        {
                            var contentRoot = _environment.ContentRootPath;
                            uploadsFolder = Path.Combine(contentRoot, "wwwroot", "uploads");
                        }
                        else
                        {
                            uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                        }
                        
                        var fileName = Path.GetFileName(media.File);
                        var filePath = Path.Combine(uploadsFolder, fileName);
                        
                        if (System.IO.File.Exists(filePath))
                        {
                            System.IO.File.Delete(filePath);
                            _logger.LogInformation($"Deleted file: {filePath}");
                        }

                        _context.MediaItems.Remove(media);
                        deletedCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error deleting file for media ID {media.Id}");
                    }
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
                _logger.LogError(ex, "Error during cleanup");
                return StatusCode(500, new { message = $"Error during cleanup: {ex.Message}" });
            }
        }
    }
}