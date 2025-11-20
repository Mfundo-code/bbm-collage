using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DonationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/donations - Get all donations (admin view)
        [HttpGet]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> GetDonations(
            [FromQuery] string? status = null,
            [FromQuery] string? donationType = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Donations
                .Include(d => d.Donor)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(d => d.Status == status);

            if (!string.IsNullOrEmpty(donationType))
                query = query.Where(d => d.DonationType == donationType);

            query = query.OrderByDescending(d => d.CreatedAt);

            var total = await query.CountAsync();
            var donations = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var donationDtos = donations.Select(d => MapToDonationDto(d, showSensitiveInfo: true)).ToList();

            return Ok(new
            {
                items = donationDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/donations/public - Get public donations (visible to all, respects anonymity)
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicDonations(
            [FromQuery] string? donationType = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Donations
                .Include(d => d.Donor)
                .Where(d => d.Status == "completed")
                .AsQueryable();

            if (!string.IsNullOrEmpty(donationType))
                query = query.Where(d => d.DonationType == donationType);

            query = query.OrderByDescending(d => d.CreatedAt);

            var total = await query.CountAsync();
            var donations = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var donationDtos = donations.Select(d => MapToDonationDto(d, showSensitiveInfo: false)).ToList();

            return Ok(new
            {
                items = donationDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // GET: api/donations/stats - Get donation statistics
        [HttpGet("stats")]
        public async Task<IActionResult> GetDonationStats()
        {
            var completedDonations = await _context.Donations
                .Where(d => d.Status == "completed")
                .ToListAsync();

            var totalAmount = completedDonations.Sum(d => d.Amount);
            var totalCount = completedDonations.Count;
            var avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

            var byType = completedDonations
                .GroupBy(d => d.DonationType)
                .Select(g => new
                {
                    type = g.Key,
                    count = g.Count(),
                    amount = g.Sum(d => d.Amount)
                })
                .ToList();

            var thisMonth = completedDonations
                .Where(d => d.CreatedAt >= DateTime.UtcNow.AddMonths(-1))
                .Sum(d => d.Amount);

            return Ok(new
            {
                totalAmount,
                totalCount,
                averageAmount = avgAmount,
                byType,
                thisMonthAmount = thisMonth
            });
        }

        // GET: api/donations/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDonation(int id)
        {
            var donation = await _context.Donations
                .Include(d => d.Donor)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (donation == null)
                return NotFound();

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            // Only donor or admin can see full details
            bool showSensitiveInfo = userRole == "admin" || 
                                    userRole == "secretary" || 
                                    donation.DonorId == userId;

            return Ok(MapToDonationDto(donation, showSensitiveInfo));
        }

        // POST: api/donations - Create new donation
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateDonation([FromBody] DonationCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? userId = null;
            if (User.Identity?.IsAuthenticated == true)
            {
                userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            }

            var donation = new Donation
            {
                DonorId = userId,
                DonorName = dto.DonorName,
                DonorEmail = dto.DonorEmail,
                Amount = dto.Amount,
                Currency = dto.Currency,
                DonationType = dto.DonationType,
                TargetId = dto.TargetId,
                Purpose = dto.Purpose,
                Message = dto.Message,
                Anonymous = dto.Anonymous,
                PaymentMethod = dto.PaymentMethod,
                TransactionReference = dto.TransactionReference,
                Status = "pending" // Will be updated after payment processing
            };

            _context.Donations.Add(donation);
            await _context.SaveChangesAsync();

            // Reload with relationships
            donation = await _context.Donations
                .Include(d => d.Donor)
                .FirstAsync(d => d.Id == donation.Id);

            return CreatedAtAction(nameof(GetDonation), new { id = donation.Id }, 
                MapToDonationDto(donation, showSensitiveInfo: true));
        }

        // PUT: api/donations/{id}/status - Update donation status (admin only)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> UpdateDonationStatus(int id, [FromBody] UpdateDonationStatusDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var donation = await _context.Donations.FindAsync(id);
            if (donation == null)
                return NotFound();

            donation.Status = dto.Status;
            donation.Notes = dto.Notes;

            if (dto.Status == "completed" && donation.CompletedAt == null)
            {
                donation.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Reload with relationships
            donation = await _context.Donations
                .Include(d => d.Donor)
                .FirstAsync(d => d.Id == donation.Id);

            return Ok(MapToDonationDto(donation, showSensitiveInfo: true));
        }

        // GET: api/donations/campaigns - Get all campaigns
        [HttpGet("campaigns")]
        public async Task<IActionResult> GetCampaigns(
            [FromQuery] string? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.DonationCampaigns
                .Include(c => c.CreatedBy)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(c => c.Status == status);

            query = query.OrderByDescending(c => c.CreatedAt);

            var total = await query.CountAsync();
            var campaigns = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var campaignDtos = campaigns.Select(c => MapToCampaignDto(c)).ToList();

            return Ok(new
            {
                items = campaignDtos,
                total = total,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize)
            });
        }

        // POST: api/donations/campaigns - Create campaign (admin only)
        [HttpPost("campaigns")]
        [Authorize(Roles = "admin,secretary")]
        public async Task<IActionResult> CreateCampaign([FromBody] DonationCampaignCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var campaign = new DonationCampaign
            {
                Title = dto.Title,
                Description = dto.Description,
                GoalAmount = dto.GoalAmount,
                Currency = dto.Currency,
                CoverImage = dto.CoverImage,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedById = userId!,
                Status = "active"
            };

            _context.DonationCampaigns.Add(campaign);
            await _context.SaveChangesAsync();

            // Reload with relationships
            campaign = await _context.DonationCampaigns
                .Include(c => c.CreatedBy)
                .FirstAsync(c => c.Id == campaign.Id);

            return CreatedAtAction(nameof(GetCampaigns), new { id = campaign.Id }, MapToCampaignDto(campaign));
        }

        private DonationDto MapToDonationDto(Donation donation, bool showSensitiveInfo)
        {
            return new DonationDto
            {
                Id = donation.Id,
                Donor = showSensitiveInfo && !donation.Anonymous && donation.Donor != null 
                    ? MapToUserDto(donation.Donor) 
                    : null,
                DonorName = donation.Anonymous ? "Anonymous" : donation.DonorName,
                DonorEmail = showSensitiveInfo ? donation.DonorEmail : null,
                Amount = donation.Amount,
                Currency = donation.Currency,
                DonationType = donation.DonationType,
                TargetId = donation.TargetId,
                Purpose = donation.Purpose,
                Message = donation.Message,
                Anonymous = donation.Anonymous,
                PaymentMethod = showSensitiveInfo ? donation.PaymentMethod : null!,
                TransactionReference = showSensitiveInfo ? donation.TransactionReference : null,
                Status = donation.Status,
                CreatedAt = donation.CreatedAt,
                CompletedAt = donation.CompletedAt,
                ReceiptUrl = showSensitiveInfo ? donation.ReceiptUrl : null,
                ReceiptSent = donation.ReceiptSent
            };
        }

        private DonationCampaignDto MapToCampaignDto(DonationCampaign campaign)
        {
            var donationCount = _context.Donations
                .Count(d => d.DonationType == "campaign" && d.TargetId == campaign.Id.ToString() && d.Status == "completed");

            var percentageReached = campaign.GoalAmount.HasValue && campaign.GoalAmount.Value > 0
                ? (campaign.CurrentAmount / campaign.GoalAmount.Value) * 100
                : 0;

            return new DonationCampaignDto
            {
                Id = campaign.Id,
                Title = campaign.Title,
                Description = campaign.Description,
                GoalAmount = campaign.GoalAmount,
                CurrentAmount = campaign.CurrentAmount,
                Currency = campaign.Currency,
                CoverImage = campaign.CoverImage,
                StartDate = campaign.StartDate,
                EndDate = campaign.EndDate,
                Status = campaign.Status,
                CreatedBy = MapToUserDto(campaign.CreatedBy),
                CreatedAt = campaign.CreatedAt,
                DonationCount = donationCount,
                PercentageReached = percentageReached
            };
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

    public class UpdateDonationStatusDto
    {
        [Required]
        public string Status { get; set; } = null!; // pending, completed, failed, refunded
        public string? Notes { get; set; }
    }
}