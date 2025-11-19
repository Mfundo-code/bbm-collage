using System;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace Backend.Services
{
    public interface IEmailService
    {
        Task<bool> SendWelcomeEmailAsync(User user, string password, OneTimeLoginToken loginToken);
        Task<bool> SendPasswordChangedNotificationAsync(User user);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendWelcomeEmailAsync(User user, string password, OneTimeLoginToken loginToken)
        {
            try
            {
                var siteUrl = _configuration["SiteUrl"] ?? "http://localhost:3000";
                var autoLoginUrl = $"{siteUrl}/auto-login?token={loginToken.Token}";

                var subject = "Welcome to Mission Bible School Platform";

                var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4A5568; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f7fafc; padding: 30px; border: 1px solid #e2e8f0; }}
        .credentials {{ background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4299e1; }}
        .credential-item {{ margin: 10px 0; }}
        .credential-label {{ font-weight: bold; color: #2d3748; }}
        .credential-value {{ color: #1a202c; font-family: monospace; font-size: 14px; }}
        .button {{ display: inline-block; padding: 12px 30px; background-color: #4299e1; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
        .info {{ background-color: #ebf8ff; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; }}
        .warning {{ background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #718096; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Welcome to Mission Bible School</h1>
        </div>
        <div class='content'>
            <h2>Hello {user.FirstName ?? user.Email},</h2>
            
            <p>Your account has been successfully created on the Mission Bible School platform. We're excited to have you join our community!</p>
            
            <div class='credentials'>
                <h3 style='margin-top: 0;'>Your Login Credentials</h3>
                <div class='credential-item'>
                    <span class='credential-label'>Email:</span>
                    <span class='credential-value'>{user.Email}</span>
                </div>
                <div class='credential-item'>
                    <span class='credential-label'>Temporary Password:</span>
                    <span class='credential-value'>{password}</span>
                </div>
                <div class='credential-item'>
                    <span class='credential-label'>Role:</span>
                    <span class='credential-value'>{GetRoleDisplay(user.Role)}</span>
                </div>
            </div>
            
            <div class='info'>
                <strong>Quick Login Option:</strong>
                <p>Click the button below to log in automatically without entering your credentials. This link is valid for 24 hours.</p>
                <center>
                    <a href='{autoLoginUrl}' class='button'>
                        Login Automatically
                    </a>
                </center>
            </div>
            
            <div class='warning'>
                <strong>⚠️ Security Notice:</strong>
                <p>For security reasons, please change your password after your first login. You can do this in your profile settings.</p>
            </div>
            
            <h3>Manual Login Instructions:</h3>
            <ol>
                <li>Go to <a href='{siteUrl}/login'>{siteUrl}/login</a></li>
                <li>Enter your email: <strong>{user.Email}</strong></li>
                <li>Enter your temporary password (shown above)</li>
                <li>Change your password in your profile settings</li>
            </ol>
            
            <h3>Need Help?</h3>
            <p>If you have any questions or issues logging in, please contact the administrator or IT support.</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from Mission Bible School Platform.</p>
            <p>Please do not reply to this email.</p>
            <p>&copy; {DateTime.UtcNow.Year} Mission Bible School. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

                var textBody = $@"
Welcome to Mission Bible School Platform

Hello {user.FirstName ?? user.Email},

Your account has been successfully created on the Mission Bible School platform.

Your Login Credentials:
------------------------
Email: {user.Email}
Temporary Password: {password}
Role: {GetRoleDisplay(user.Role)}

QUICK LOGIN (valid for 24 hours):
{autoLoginUrl}

Manual Login Instructions:
1. Go to {siteUrl}/login
2. Enter your email: {user.Email}
3. Enter your temporary password
4. Change your password in your profile settings

SECURITY NOTICE:
For security reasons, please change your password after your first login.

Need Help?
If you have any questions or issues logging in, please contact the administrator.

---
This is an automated message from Mission Bible School Platform.
© {DateTime.UtcNow.Year} Mission Bible School. All rights reserved.
";

                await SendEmailAsync(user.Email!, subject, htmlBody, textBody);

                _logger.LogInformation($"Welcome email sent successfully to {user.Email}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send welcome email to {user.Email}");
                return false;
            }
        }

        public async Task<bool> SendPasswordChangedNotificationAsync(User user)
        {
            try
            {
                var subject = "Password Changed Successfully";

                var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .content {{ background-color: #f7fafc; padding: 30px; border: 1px solid #e2e8f0; border-radius: 5px; }}
        .success {{ background-color: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='content'>
            <h2>Password Changed Successfully</h2>
            
            <div class='success'>
                <p>Hello {user.FirstName ?? user.Email},</p>
                <p>Your password has been successfully changed.</p>
            </div>
            
            <p><strong>If you did not make this change,</strong> please contact the administrator immediately.</p>
            
            <p>For security, we recommend that you:</p>
            <ul>
                <li>Use a strong, unique password</li>
                <li>Never share your password with anyone</li>
                <li>Log out from shared devices</li>
            </ul>
        </div>
    </div>
</body>
</html>";

                var textBody = $@"
Password Changed Successfully

Hello {user.FirstName ?? user.Email},

Your password has been successfully changed.

If you did not make this change, please contact the administrator immediately.

Security Tips:
- Use a strong, unique password
- Never share your password with anyone
- Log out from shared devices
";

                await SendEmailAsync(user.Email!, subject, htmlBody, textBody);

                _logger.LogInformation($"Password change notification sent to {user.Email}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send password change notification to {user.Email}");
                return false;
            }
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody, string textBody)
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUsername = _configuration["Email:SmtpUsername"];
            var smtpPassword = _configuration["Email:SmtpPassword"];
            var fromEmail = _configuration["Email:FromEmail"];
            var fromName = _configuration["Email:FromName"] ?? "Mission Bible School";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };

            mailMessage.To.Add(toEmail);

            // Add plain text alternative
            var plainView = AlternateView.CreateAlternateViewFromString(textBody, null, "text/plain");
            var htmlView = AlternateView.CreateAlternateViewFromString(htmlBody, null, "text/html");
            mailMessage.AlternateViews.Add(plainView);
            mailMessage.AlternateViews.Add(htmlView);

            await client.SendMailAsync(mailMessage);
        }

        private static string GetRoleDisplay(string role)
        {
            return role switch
            {
                "admin" => "Admin",
                "secretary" => "Secretary/Staff",
                "pastor" => "Pastor/Lecturer",
                "missionary" => "Missionary",
                "student" => "Student",
                "alumni" => "Alumni",
                _ => role
            };
        }
    }
}