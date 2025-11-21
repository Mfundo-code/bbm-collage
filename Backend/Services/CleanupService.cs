using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting; 
using Backend.Models; 

namespace Backend.Services
{
    public class CleanupService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<CleanupService> _logger;
        private readonly IWebHostEnvironment _environment;

        public CleanupService(IServiceProvider services, ILogger<CleanupService> logger, IWebHostEnvironment environment)
        {
            _services = services;
            _logger = logger;
            _environment = environment;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Cleanup Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _services.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    
                    // Delete expired videos and audio files (older than 7 days)
                    var expiredMedia = await context.MediaItems
                        .Where(m => m.ExpiresAt != null && m.ExpiresAt < DateTime.UtcNow)
                        .ToListAsync(stoppingToken);

                    foreach (var media in expiredMedia)
                    {
                        try
                        {
                            // Delete physical file
                            var filePath = Path.Combine(_environment.WebRootPath, media.File.TrimStart('/'));
                            if (System.IO.File.Exists(filePath))
                            {
                                System.IO.File.Delete(filePath);
                                _logger.LogInformation($"Deleted file: {filePath}");
                            }

                            context.MediaItems.Remove(media);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Error deleting file for media ID {media.Id}");
                        }
                    }

                    await context.SaveChangesAsync(stoppingToken);

                    if (expiredMedia.Count > 0)
                    {
                        _logger.LogInformation($"Cleaned up {expiredMedia.Count} expired media files");
                    }

                    // Clean up old Sunday service posts (older than 7 days)
                    var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                    var oldServices = await context.Posts
                        .Where(p => p.PostType == "sunday_service" && p.CreatedAt < sevenDaysAgo)
                        .ToListAsync(stoppingToken);

                    if (oldServices.Count > 0)
                    {
                        context.Posts.RemoveRange(oldServices);
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation($"Cleaned up {oldServices.Count} old Sunday service posts");
                    }

                    // Clean up expired homiletics entries
                    var expiredHomiletics = await context.HomileticsEntries
                        .Where(h => h.ExpiresAt < DateTime.UtcNow)
                        .ToListAsync(stoppingToken);

                    if (expiredHomiletics.Count > 0)
                    {
                        context.HomileticsEntries.RemoveRange(expiredHomiletics);
                        await context.SaveChangesAsync(stoppingToken);
                        _logger.LogInformation($"Cleaned up {expiredHomiletics.Count} expired homiletics entries");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during cleanup process");
                }

                // Run once per day
                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}